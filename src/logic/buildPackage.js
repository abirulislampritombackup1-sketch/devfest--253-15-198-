import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Sanitizes text to WinAnsi/ASCII characters safe for standard pdf-lib Helvetica fonts.
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeForPdf(text) {
  if (!text) return ''
  return String(text)
    // Replace common unicode quotation marks and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Replace any remaining non-printable or high unicode chars that WinAnsi cannot encode
    .replace(/[^\x20-\x7E]/g, ' ')
    .trim()
}

/**
 * Formats today's date as YYYY-MM-DD string.
 */
function getTodayString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Compiles the complete tender package PDF.
 * @param {object} params
 * @param {object} params.tender - Tender metadata
 * @param {object[]} params.requirements - Sorted requirements
 * @param {Record<string, string>} params.matches - reqId -> fileId
 * @param {Map<string, object>} params.filesMap - fileId -> { name, bytes, pages }
 * @returns {Promise<Uint8Array>}
 */
export async function buildTenderPackagePdf({ tender, requirements, matches, filesMap }) {
  // 1. First build the raw combined document (Cover + all pages in sequence)
  const rawPdf = await PDFDocument.create()
  const helvetica = await rawPdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await rawPdf.embedFont(StandardFonts.HelveticaBold)

  // A4 dimensions: 595.28 x 841.89 points
  const A4_WIDTH = 595.28
  const A4_HEIGHT = 841.89

  // Filter included requirements (all mandatory, plus optional if matched)
  const includedDocs = []
  for (const req of requirements) {
    const fileId = matches[req.id]
    if (fileId && filesMap.has(fileId)) {
      const file = filesMap.get(fileId)
      includedDocs.push({
        req,
        file
      })
    }
  }

  // -------------------------------------------------------------
  // BUILD PAGE 1: COVER PAGE (Strictly in English)
  // -------------------------------------------------------------
  const coverPage = rawPdf.addPage([A4_WIDTH, A4_HEIGHT])
  const margin = 50
  let cursorY = A4_HEIGHT - 60

  // Draw Top Banner / Header
  coverPage.drawRectangle({
    x: margin,
    y: cursorY - 32,
    width: A4_WIDTH - (margin * 2),
    height: 40,
    color: rgb(0.12, 0.23, 0.54) // #1e3a8a Navy
  })

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: margin + 18,
    y: cursorY - 18,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1)
  })

  cursorY -= 65

  // Tender Metadata Section
  const metaRows = [
    { label: 'Tender ID', value: tender.tender_id },
    { label: 'Tender Title', value: tender.title },
    { label: 'Procuring Entity', value: tender.procuring_entity },
    { label: 'Bidder Name', value: tender.bidder },
    { label: 'Submission Deadline', value: tender.submission_deadline },
    { label: 'Package Creation Date', value: getTodayString() }
  ]

  coverPage.drawText('TENDER DETAILS', {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.15, 0.2, 0.3)
  })

  cursorY -= 6
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: A4_WIDTH - margin, y: cursorY },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92)
  })
  cursorY -= 18

  for (const row of metaRows) {
    coverPage.drawText(sanitizeForPdf(row.label) + ':', {
      x: margin,
      y: cursorY,
      size: 10,
      font: helveticaBold,
      color: rgb(0.3, 0.35, 0.45)
    })

    const cleanVal = sanitizeForPdf(row.value)
    // Draw truncated if exceedingly long to guarantee single page
    const displayVal = cleanVal.length > 70 ? cleanVal.substring(0, 67) + '...' : cleanVal
    coverPage.drawText(displayVal, {
      x: margin + 140,
      y: cursorY,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.15, 0.2)
    })
    cursorY -= 17
  }

  cursorY -= 14

  // Table of Included Documents
  coverPage.drawText('INCLUDED DOCUMENTS SCHEDULE', {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.15, 0.2, 0.3)
  })

  cursorY -= 6
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: A4_WIDTH - margin, y: cursorY },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92)
  })
  cursorY -= 20

  // Document table header
  coverPage.drawRectangle({
    x: margin,
    y: cursorY - 4,
    width: A4_WIDTH - (margin * 2),
    height: 18,
    color: rgb(0.94, 0.96, 0.98)
  })

  coverPage.drawText('#', { x: margin + 8, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.35, 0.4) })
  coverPage.drawText('Document Title', { x: margin + 35, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.35, 0.4) })
  coverPage.drawText('File Attached', { x: margin + 260, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.35, 0.4) })
  coverPage.drawText('Pages', { x: A4_WIDTH - margin - 45, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.35, 0.4) })

  cursorY -= 20

  // Determine line height to ensure everything fits on this single cover page
  const availableHeight = cursorY - 60
  const itemRowHeight = Math.max(12, Math.min(20, Math.floor(availableHeight / (includedDocs.length || 1))))

  includedDocs.forEach((item, index) => {
    const docTitle = sanitizeForPdf(item.req.title_en)
    const fileName = sanitizeForPdf(item.file.name)
    const truncatedTitle = docTitle.length > 38 ? docTitle.substring(0, 35) + '...' : docTitle
    const truncatedFile = fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName

    coverPage.drawText(String(index + 1), {
      x: margin + 8,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: rgb(0.2, 0.25, 0.3)
    })

    coverPage.drawText(truncatedTitle, {
      x: margin + 35,
      y: cursorY,
      size: 9,
      font: helveticaBold,
      color: rgb(0.1, 0.15, 0.2)
    })

    coverPage.drawText(truncatedFile, {
      x: margin + 260,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: rgb(0.35, 0.4, 0.45)
    })

    coverPage.drawText(String(item.file.pages), {
      x: A4_WIDTH - margin - 35,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: rgb(0.2, 0.25, 0.3)
    })

    cursorY -= itemRowHeight
  })

  // -------------------------------------------------------------
  // MERGE DOCUMENT PAGES IN STRICT ORDER SEQUENCE
  // -------------------------------------------------------------
  for (const item of includedDocs) {
    try {
      const srcPdf = await PDFDocument.load(item.file.bytes)
      const pageIndices = srcPdf.getPageIndices()
      const copiedPages = await rawPdf.copyPages(srcPdf, pageIndices)
      for (const p of copiedPages) {
        rawPdf.addPage(p)
      }
    } catch (err) {
      console.error(`Failed to copy pages for ${item.file.name}:`, err)
    }
  }

  // -------------------------------------------------------------
  // STEP 3: APPLY NON-OVERLAPPING BOTTOM BAND & FOOTER
  // -------------------------------------------------------------
  // Total pages in the final package (Y)
  const totalPages = rawPdf.getPageCount()
  const cleanTenderId = sanitizeForPdf(tender.tender_id)

  const finalPdf = await PDFDocument.create()
  const finalFont = await finalPdf.embedFont(StandardFonts.Helvetica)
  const FOOTER_BAND_HEIGHT = 28 // points added to bottom of page

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const origPage = rawPdf.getPage(pageIdx)
    const { width, height } = origPage.getSize()

    // Embed the original page
    const embeddedPage = await finalPdf.embedPage(origPage)

    // Create a new page enlarged by the bottom band
    const newPage = finalPdf.addPage([width, height + FOOTER_BAND_HEIGHT])

    // Draw the embedded original page shifted UPWARDS by FOOTER_BAND_HEIGHT
    newPage.drawPage(embeddedPage, {
      x: 0,
      y: FOOTER_BAND_HEIGHT,
      width,
      height
    })

    // Draw clean solid white background band across bottom
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: FOOTER_BAND_HEIGHT,
      color: rgb(1, 1, 1)
    })

    // Draw subtle top divider line for the footer
    newPage.drawLine({
      start: { x: 30, y: FOOTER_BAND_HEIGHT - 1 },
      end: { x: width - 30, y: FOOTER_BAND_HEIGHT - 1 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.92)
    })

    // Stamped text: "<tender_id> | Page X of Y"
    const footerText = `${cleanTenderId}  |  Page ${pageIdx + 1} of ${totalPages}`
    const textWidth = finalFont.widthOfTextAtSize(footerText, 9.5)
    const textX = (width - textWidth) / 2
    const textY = 9

    newPage.drawText(footerText, {
      x: textX,
      y: textY,
      size: 9.5,
      font: finalFont,
      color: rgb(0.18, 0.24, 0.35)
    })
  }

  return await finalPdf.save()
}
