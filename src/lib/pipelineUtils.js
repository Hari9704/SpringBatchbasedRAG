export const PIPELINE_STEPS = [
  {
    key: 'VALIDATING',
    label: 'Validating upload',
    description: 'Checking file type, size, and storage metadata.',
  },
  {
    key: 'EXTRACTING',
    label: 'Extracting text',
    description: 'Reading document text from the uploaded file.',
  },
  {
    key: 'CLEANING',
    label: 'Cleaning content',
    description: 'Normalizing extracted text before chunking.',
  },
  {
    key: 'CHUNKING',
    label: 'Chunking content',
    description: 'Splitting the document into semantic chunks.',
  },
  {
    key: 'EMBEDDING',
    label: 'Generating embeddings',
    description: 'Writing vector embeddings for retrieval.',
  },
  {
    key: 'PROCESSED',
    label: 'Ready for chat',
    description: 'This document can now be queried in AI Chat.',
  },
]

export function formatDuration(ms) {
  if (ms == null || typeof ms !== 'number' || Number.isNaN(ms) || ms < 0) return null
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatElapsed(startedAt, now) {
  if (!startedAt) return null
  return formatDuration(now - startedAt)
}

export function getStepState(stepKey, documentStatus) {
  if (documentStatus === 'FAILED') return 'pending'

  const normalizedStatus = documentStatus === 'UPLOADED' ? 'VALIDATING' : documentStatus
  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.key === normalizedStatus)
  const stepIndex = PIPELINE_STEPS.findIndex((s) => s.key === stepKey)

  if (documentStatus === 'PROCESSED' && stepKey === 'PROCESSED') return 'done'
  if (stepIndex < currentIndex) return 'done'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}
