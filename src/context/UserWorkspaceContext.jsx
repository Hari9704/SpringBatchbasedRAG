import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  if (!stored) {
    return null;
  }

  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Keep the user's current selection when that document still exists.
 * (Previous logic always preferred the first PROCESSED doc, which stole focus from a newly uploaded file.)
 */
function getNextSelectedDocumentId(documents, preferredId) {
  if (!documents.length) {
    return null;
  }

  if (preferredId != null && documents.some((document) => document.id === preferredId)) {
    return preferredId;
  }

  const processedDocuments = documents.filter((document) => document.status === 'PROCESSED');
  if (processedDocuments.length > 0) {
    return processedDocuments[0].id;
  }

  return documents[0].id;
}

/** Normalize upload API payload (partial) into the same shape as GET /api/documents rows. */
function documentFromUploadResponse(payload, userId = DEFAULT_USER_ID) {
  if (!payload || payload.id == null) {
    return null;
  }

  return {
    id: Number(payload.id),
    userId: payload.userId != null ? Number(payload.userId) : userId,
    name: payload.name || 'Untitled',
    type: payload.type || 'FILE',
    sizeBytes: payload.sizeBytes != null ? Number(payload.sizeBytes) : 0,
    status: payload.status || 'UPLOADED',
    chunks: payload.chunks != null ? Number(payload.chunks) : 0,
    storagePath: payload.storagePath,
    contentHash: payload.contentHash,
    uploadDate: payload.uploadDate || new Date().toISOString(),
    processedDate: payload.processedDate ?? null,
    version: payload.version ?? 1,
    rawContent: payload.rawContent,
  };
}

function mergeDocumentList(previous, incoming) {
  if (!incoming) {
    return previous;
  }

  const without = previous.filter((document) => document.id !== incoming.id);
  return [incoming, ...without];
}

function getLatestJobsByDocumentId(jobs) {
  return jobs.reduce((accumulator, job) => {
    const documentId = job?.documentId;
    if (documentId == null) {
      return accumulator;
    }

    const current = accumulator[documentId];

    if (!current) {
      accumulator[documentId] = job;
      return accumulator;
    }

    const nextStartedAt = new Date(job.startTime || 0).getTime();
    const currentStartedAt = new Date(current.startTime || 0).getTime();

    if (nextStartedAt >= currentStartedAt) {
      accumulator[documentId] = job;
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
  const selectedDocumentIdRef = useRef(selectedDocumentId);

  useEffect(() => {
    selectedDocumentIdRef.current = selectedDocumentId;
  }, [selectedDocumentId]);

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

    let nextDocuments = null;
    let nextJobs = null;
    const errors = [];

    try {
      nextDocuments = await fetchDocuments(DEFAULT_USER_ID);
    } catch (error) {
      errors.push(error.message || 'Could not load documents');
    }

    try {
      nextJobs = await fetchBatchJobs();
    } catch (error) {
      errors.push(error.message || 'Could not load batch jobs');
    }

    if (Array.isArray(nextDocuments)) {
      setDocuments(nextDocuments);
    } else if (!silent) {
      setDocuments([]);
    }

    if (Array.isArray(nextJobs)) {
      setJobs(nextJobs);
    } else if (!silent) {
      setJobs([]);
    }

    if (errors.length) {
      if (!silent) {
        setWorkspaceError([...new Set(errors)].join(' · '));
      }
    } else {
      setWorkspaceError('');
    }

    if (Array.isArray(nextDocuments)) {
      if (!nextDocuments.length) {
        persistSelectedDocument(null);
      } else {
        const currentSelection = selectedDocumentIdRef.current;
        const nextSelectedDocumentId = getNextSelectedDocumentId(nextDocuments, currentSelection);
        if (nextSelectedDocumentId !== currentSelection) {
          persistSelectedDocument(nextSelectedDocumentId);
        }
      }
    }

    if (!silent) {
      setLoading(false);
    }
  }, [persistSelectedDocument]);

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

  useEffect(() => {
    const onFocus = () => {
      refreshWorkspace({ silent: true });
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshWorkspace]);

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
        const raw = await uploadDocument(file, DEFAULT_USER_ID);
        const normalized = documentFromUploadResponse(raw, DEFAULT_USER_ID);
        if (normalized) {
          setDocuments((previous) => mergeDocumentList(previous, normalized));
          persistSelectedDocument(normalized.id);
        }

        try {
          await triggerBatch(Number(raw?.id));
        } catch (batchError) {
          errors.push(
            `${file.name}: Uploaded, but processing could not start (${batchError.message || 'batch error'}). Use Reprocess in My Documents.`,
          );
        }

        successCount += 1;
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    await refreshWorkspace({ silent: true });

    return { successCount, errors };
  }, [persistSelectedDocument, refreshWorkspace]);

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
