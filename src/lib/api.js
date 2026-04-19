export const DEFAULT_USER_ID = 1;

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message = payload?.error || payload?.message || payload || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export function fetchDocuments(userId = DEFAULT_USER_ID) {
  return request(`/api/documents?userId=${userId}`);
}

export function fetchBatchJobs() {
  return request('/api/batch/jobs');
}

export function uploadDocument(file, userId = DEFAULT_USER_ID) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', String(userId));

  return request('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export function triggerBatch(documentId) {
  return request('/api/batch/trigger', {
    method: 'POST',
    body: JSON.stringify({ documentId }),
  });
}

export function deleteDocument(documentId, userId = DEFAULT_USER_ID) {
  return request(`/api/documents/${documentId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

export function runQuery(payload) {
  return request('/api/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchQueryHistory(userId = DEFAULT_USER_ID) {
  return request(`/api/query/history/${userId}`);
}

export function fetchQueryStats(userId = DEFAULT_USER_ID) {
  return request(`/api/query/stats/${userId}`);
}

export function fetchDocumentStats(userId = DEFAULT_USER_ID) {
  return request(`/api/documents/stats?userId=${userId}`);
}

export function fetchFeedback() {
  return request('/api/feedback');
}

export function fetchAllDocumentsAdmin() {
  return request('/api/documents/all');
}
