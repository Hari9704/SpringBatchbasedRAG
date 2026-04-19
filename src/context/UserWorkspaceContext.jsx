import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_USER_ID,
  deleteDocument as deleteDocumentRequest,
  fetchBatchJobs,
  fetchDocuments,
  triggerBatch,
  uploadDocument,
} from '../lib/api';

const STORAGE_KEY = 'docintell-selected-document-id';
const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING']);
const ACTIVE_JOB_STATUSES = new Set(['STARTED', 'RUNNING']);

const UserWorkspaceContext = createContext(null);

function getStoredDocumentId() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) : null;
}

function getNextSelectedDocumentId(documents, preferredId) {
  if (!documents.length) {
    return null;
  }

  const processedDocuments = documents.filter((document) => document.status === 'PROCESSED');

  if (processedDocuments.some((document) => document.id === preferredId)) {
    return preferredId;
  }

  if (processedDocuments.length > 0) {
    return processedDocuments[0].id;
  }

  if (documents.some((document) => document.id === preferredId)) {
    return preferredId;
  }

  return documents[0].id;
}

function getLatestJobsByDocumentId(jobs) {
  return jobs.reduce((accumulator, job) => {
    const current = accumulator[job.documentId];

    if (!current) {
      accumulator[job.documentId] = job;
      return accumulator;
    }

    const nextStartedAt = new Date(job.startTime || 0).getTime();
    const currentStartedAt = new Date(current.startTime || 0).getTime();

    if (nextStartedAt >= currentStartedAt) {
      accumulator[job.documentId] = job;
    }

    return accumulator;
  }, {});
}

export function UserWorkspaceProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(() => getStoredDocumentId());
  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState('');

  const persistSelectedDocument = useCallback((documentId) => {
    setSelectedDocumentId(documentId);

    if (documentId === null || documentId === undefined) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(documentId));
  }, []);

  const refreshWorkspace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const [nextDocuments, nextJobs] = await Promise.all([
        fetchDocuments(DEFAULT_USER_ID),
        fetchBatchJobs(),
      ]);

      setDocuments(nextDocuments);
      setJobs(nextJobs);
      setWorkspaceError('');

      const nextSelectedDocumentId = getNextSelectedDocumentId(nextDocuments, selectedDocumentId);
      if (nextSelectedDocumentId !== selectedDocumentId) {
        persistSelectedDocument(nextSelectedDocumentId);
      }
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to load your workspace right now.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [persistSelectedDocument, selectedDocumentId]);

  useEffect(() => {
    refreshWorkspace();
  }, [refreshWorkspace]);

  const hasActiveProcessing = useMemo(() => (
    documents.some((document) => PROCESSING_STATUSES.has(document.status))
    || jobs.some((job) => ACTIVE_JOB_STATUSES.has(job.status))
  ), [documents, jobs]);

  useEffect(() => {
    if (!hasActiveProcessing) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshWorkspace({ silent: true });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [hasActiveProcessing, refreshWorkspace]);

  const processedDocuments = useMemo(
    () => documents.filter((document) => document.status === 'PROCESSED'),
    [documents],
  );

  const latestJobsByDocumentId = useMemo(() => getLatestJobsByDocumentId(jobs), [jobs]);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) || null,
    [documents, selectedDocumentId],
  );

  const uploadFiles = useCallback(async (files) => {
    const errors = [];
    let successCount = 0;

    for (const file of files) {
      try {
        const uploadedDocument = await uploadDocument(file, DEFAULT_USER_ID);
        await triggerBatch(uploadedDocument.id);
        successCount += 1;
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    await refreshWorkspace({ silent: true });

    return { successCount, errors };
  }, [refreshWorkspace]);

  const reprocessDocument = useCallback(async (documentId) => {
    await triggerBatch(documentId);
    await refreshWorkspace({ silent: true });
  }, [refreshWorkspace]);

  const removeDocument = useCallback(async (documentId) => {
    await deleteDocumentRequest(documentId, DEFAULT_USER_ID);
    await refreshWorkspace({ silent: true });
  }, [refreshWorkspace]);

  const value = useMemo(() => ({
    documents,
    jobs,
    latestJobsByDocumentId,
    processedDocuments,
    selectedDocumentId,
    selectedDocument,
    loading,
    workspaceError,
    refreshWorkspace,
    selectDocument: persistSelectedDocument,
    uploadFiles,
    reprocessDocument,
    removeDocument,
    hasActiveProcessing,
  }), [
    documents,
    hasActiveProcessing,
    jobs,
    latestJobsByDocumentId,
    loading,
    persistSelectedDocument,
    processedDocuments,
    refreshWorkspace,
    removeDocument,
    reprocessDocument,
    selectedDocument,
    selectedDocumentId,
    uploadFiles,
    workspaceError,
  ]);

  return (
    <UserWorkspaceContext.Provider value={value}>
      {children}
    </UserWorkspaceContext.Provider>
  );
}

export function useUserWorkspace() {
  const context = useContext(UserWorkspaceContext);

  if (!context) {
    throw new Error('useUserWorkspace must be used inside UserWorkspaceProvider.');
  }

  return context;
}
