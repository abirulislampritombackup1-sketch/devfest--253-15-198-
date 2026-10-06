import { PDFDocument } from 'pdf-lib'

export const MAX_FILES = 30
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024 // 50 MB

/**
 * Checks if raw bytes contain the %PDF- magic signature in the initial header bytes.
 * @param {Uint8Array} bytes 
 * @returns {boolean}
 */
export function hasPdfMagicHeader(bytes) {
  if (!bytes || bytes.length < 5) return false
  const header = String.fromCharCode(...bytes.subarray(0, 1024))
  return header.includes('%PDF-')
}

/**
 * Validates a single PDF file buffer, extracts page count, and detects corruption or encryption.
 * @param {Uint8Array} bytes 
 * @param {string} fileName 
 * @returns {Promise<{ valid: boolean, error?: string, pages?: number }>}
 */
export async function verifyPdfFile(bytes, fileName) {
  if (!hasPdfMagicHeader(bytes)) {
    return { valid: false, error: 'error.notPdf' }
  }

  try {
    const pdfDoc = await PDFDocument.load(bytes)
    const pages = pdfDoc.getPageCount()
    return { valid: true, pages }
  } catch (err) {
    const message = String(err?.message || '').toLowerCase()
    if (message.includes('encrypt') || message.includes('password') || message.includes('security')) {
      return { valid: false, error: 'error.encrypted' }
    }
    return { valid: false, error: 'error.damaged' }
  }
}

/**
 * Validates file count and aggregate size limits.
 * @param {number} currentCount 
 * @param {number} currentSize 
 * @param {number} newCount 
 * @param {number} newSize 
 * @returns {{ valid: boolean, error?: string }}
 */
export function checkFileLimits(currentCount, currentSize, newCount, newSize) {
  if (currentCount + newCount > MAX_FILES) {
    return { valid: false, error: 'error.limitFiles' }
  }
  if (currentSize + newSize > MAX_TOTAL_BYTES) {
    return { valid: false, error: 'error.limitSize' }
  }
  return { valid: true }
}
