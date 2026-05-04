export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result || '')
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsText(file, 'utf-8')
  })
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsArrayBuffer(file)
  })
}

export function chunkText(text, wordsPerChunk = 350) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const words = cleaned.split(' ')
  const chunks = []
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const slice = words.slice(i, i + wordsPerChunk).join(' ')
    if (slice.trim()) {
      chunks.push({ text: slice, wordStart: i, wordEnd: Math.min(i + wordsPerChunk, words.length) })
    }
  }
  return chunks.length ? chunks : [{ text: cleaned.slice(0, 2000), wordStart: 0, wordEnd: 0 }]
}

export async function extractText(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()

  if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'js', 'ts', 'py'].includes(ext)) {
    return readFileAsText(file)
  }

  if (ext === 'pdf') {
    return extractPdfText(file)
  }

  if (ext === 'docx') {
    return extractDocxText(file)
  }

  // Fallback — try as plain text
  try {
    const text = await readFileAsText(file)
    if (text && text.length > 20 && /[a-zA-Z]/.test(text)) {
      return text
    }
  } catch {
    // ignore
  }

  throw new Error(
    `File type ".${ext}" is not directly supported. Please convert to .txt, .pdf, or .docx.`
  )
}

async function extractPdfText(file) {
  // Best-effort: scan binary for readable text runs
  const buffer = await readFileAsArrayBuffer(file)
  const bytes = new Uint8Array(buffer)
  const chars = []
  let prevWasText = false

  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i]
    if (c >= 32 && c < 127) {
      chars.push(String.fromCharCode(c))
      prevWasText = true
    } else if ((c === 10 || c === 13 || c === 9) && prevWasText) {
      chars.push(' ')
    } else {
      if (prevWasText) chars.push(' ')
      prevWasText = false
    }
  }

  const raw = chars.join('')
  const runs = raw.match(/[A-Za-z][A-Za-z\s\d,.!?;:()\-'"]{8,}/g) || []
  const text = runs.join(' ').replace(/\s{2,}/g, ' ').trim()

  if (text.length < 100) {
    throw new Error(
      'Could not extract enough readable text from this PDF. ' +
      'Try saving it as a .txt file, or paste the content directly.'
    )
  }

  return text
}

async function extractDocxText(file) {
  // DOCX is a ZIP — extract word/document.xml and strip tags
  try {
    const buffer = await readFileAsArrayBuffer(file)
    const bytes = new Uint8Array(buffer)

    // Check ZIP magic number (PK)
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error('Not a valid DOCX file.')
    }

    // Simple approach: find UTF-8 text in the buffer (word content appears as XML)
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const raw = decoder.decode(bytes)

    // Extract text between XML tags from word/document.xml region
    const xmlMatch = raw.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/)
    if (xmlMatch) {
      const text = xmlMatch[1]
        .replace(/<w:t[^>]*>/g, '')
        .replace(/<\/w:t>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (text.length > 50) return text
    }

    throw new Error('Could not parse DOCX structure.')
  } catch (err) {
    throw new Error(
      err.message.includes('DOCX')
        ? err.message
        : `Could not extract text from DOCX. Try saving as .txt. (${err.message})`
    )
  }
}
