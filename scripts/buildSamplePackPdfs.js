import fs from 'fs'
import path from 'path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Helper colors
const NAVY_BANNER = rgb(0.14, 0.18, 0.26)
const GREEN_BANNER = rgb(0.08, 0.35, 0.18)
const RED_TEXT = rgb(0.8, 0.15, 0.15)
const TEXT_BLACK = rgb(0.1, 0.1, 0.1)
const TEXT_MUTED = rgb(0.4, 0.45, 0.5)
const LIGHT_BG = rgb(0.93, 0.96, 0.99)
const BORDER_COLOR = rgb(0.8, 0.85, 0.9)
const WATERMARK_COLOR = rgb(0.94, 0.92, 0.92)

function drawWatermark(page, font) {
  page.drawText('SAMPLE', {
    x: 140,
    y: 240,
    size: 96,
    font,
    color: WATERMARK_COLOR,
    rotate: { type: 'degrees', angle: 45 }
  })
}

function drawHeaderBanner(page, { bannerColor = NAVY_BANNER, title, subtitle, pageInfo }, fontBold, fontRegular) {
  const width = page.getWidth()
  const height = page.getHeight()

  page.drawRectangle({
    x: 0,
    y: height - 55,
    width,
    height: 55,
    color: bannerColor
  })

  page.drawText(title, {
    x: 40,
    y: height - 28,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1)
  })

  page.drawText(subtitle, {
    x: 40,
    y: height - 44,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.95)
  })

  if (pageInfo) {
    page.drawText(pageInfo, {
      x: width - 100,
      y: height - 44,
      size: 9,
      font: fontRegular,
      color: rgb(0.85, 0.9, 0.95)
    })
  }

  // Red sample document text
  const disclaimer = 'SAMPLE DOCUMENT - FICTIONAL DATA - FOR AI DEVFEST CONTEST USE ONLY'
  page.drawText(disclaimer, {
    x: 130,
    y: height - 72,
    size: 7.5,
    font: fontBold,
    color: RED_TEXT
  })
}

function drawSignature(page, x, y, name, role, fontBold, fontRegular) {
  // Draw signature line and squiggle
  page.drawLine({
    start: { x, y: y + 25 },
    end: { x: x + 150, y: y + 25 },
    thickness: 1,
    color: rgb(0.2, 0.25, 0.35)
  })

  // Blue squiggle
  page.drawLine({ start: { x: x + 5, y: y + 35 }, end: { x: x + 25, y: y + 42 }, thickness: 1.5, color: rgb(0.1, 0.3, 0.7) })
  page.drawLine({ start: { x: x + 25, y: y + 42 }, end: { x: x + 45, y: y + 36 }, thickness: 1.5, color: rgb(0.1, 0.3, 0.7) })
  page.drawLine({ start: { x: x + 45, y: y + 36 }, end: { x: x + 70, y: y + 44 }, thickness: 1.5, color: rgb(0.1, 0.3, 0.7) })
  page.drawLine({ start: { x: x + 70, y: y + 44 }, end: { x: x + 95, y: y + 38 }, thickness: 1.5, color: rgb(0.1, 0.3, 0.7) })

  page.drawText(name, {
    x,
    y: y + 10,
    size: 9.5,
    font: fontBold,
    color: TEXT_BLACK
  })

  page.drawText(role, {
    x,
    y: y - 3,
    size: 8.5,
    font: fontRegular,
    color: TEXT_MUTED
  })
}

// ----------------------------------------------------------------------
// 1. FINANCIAL PROPOSAL (2 pages)
// ----------------------------------------------------------------------
async function buildFinancialProposal() {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  // Page 1
  const p1 = doc.addPage([595.28, 841.89])
  drawWatermark(p1, fontBold)
  drawHeaderBanner(p1, {
    title: 'Meghna Tech Solutions Ltd.',
    subtitle: 'Financial Proposal - Tender T-2026-0417',
    pageInfo: 'Page 1 of 2'
  }, fontBold, fontRegular)

  let y = 720
  p1.drawText('Price Schedule', { x: 40, y, size: 13, font: fontBold, color: rgb(0.1, 0.3, 0.6) })
  y -= 18
  p1.drawText('All prices are in Bangladeshi Taka (BDT) and include VAT, taxes, delivery and installation.', {
    x: 40, y, size: 9, font: fontRegular, color: TEXT_BLACK
  })
  y -= 25

  // Table header
  p1.drawRectangle({ x: 40, y: y - 5, width: 515.28, height: 20, color: LIGHT_BG })
  p1.drawText('Lot', { x: 48, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
  p1.drawText('Description', { x: 80, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
  p1.drawText('Qty', { x: 260, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
  p1.drawText('Unit price', { x: 340, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
  p1.drawText('Total', { x: 450, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
  y -= 20

  const items = [
    { lot: '1', desc: 'Desktop computer', qty: '60', unit: '1,15,000', total: '69,00,000' },
    { lot: '2', desc: 'Laptop computer', qty: '25', unit: '1,30,000', total: '32,50,000' },
    { lot: '3', desc: 'Network laser printer', qty: '8', unit: '65,000', total: '5,20,000' },
    { lot: '4', desc: 'Online UPS, 1 kVA', qty: '60', unit: '18,000', total: '10,80,000' },
    { lot: '5', desc: 'Managed switch', qty: '4', unit: '95,000', total: '3,80,000' }
  ]

  for (const item of items) {
    p1.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 0.5, color: BORDER_COLOR })
    p1.drawText(item.lot, { x: 48, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
    p1.drawText(item.desc, { x: 80, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
    p1.drawText(item.qty, { x: 260, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
    p1.drawText(item.unit, { x: 340, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
    p1.drawText(item.total, { x: 450, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
    y -= 22
  }

  p1.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 1, color: rgb(0.2, 0.3, 0.4) })
  p1.drawText('Grand total: BDT 1,21,30,000', {
    x: 370, y: y - 2, size: 10, font: fontBold, color: TEXT_BLACK
  })

  // Page 2
  const p2 = doc.addPage([595.28, 841.89])
  drawWatermark(p2, fontBold)
  drawHeaderBanner(p2, {
    title: 'Meghna Tech Solutions Ltd.',
    subtitle: 'Financial Proposal - Tender T-2026-0417',
    pageInfo: 'Page 2 of 2'
  }, fontBold, fontRegular)

  y = 720
  p2.drawText('Payment Terms and Validity', { x: 40, y, size: 13, font: fontBold, color: rgb(0.1, 0.3, 0.6) })
  y -= 22
  p2.drawText('Payment: 80% after delivery and installation, 20% after successful acceptance testing.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })
  y -= 18
  p2.drawText('Validity: This financial offer is valid for 120 days from the submission deadline.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })
  y -= 18
  p2.drawText('In words: One Crore Twenty-One Lakh Thirty Thousand Taka only.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })

  drawSignature(p2, 40, 200, 'Rafiq Hasan', 'Managing Director, Meghna Tech Solutions Ltd.', fontBold, fontRegular)

  return await doc.save()
}

// ----------------------------------------------------------------------
// 2. TIN CERTIFICATE (1 page)
// ----------------------------------------------------------------------
async function buildTinCertificate() {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const page = doc.addPage([595.28, 841.89])
  drawWatermark(page, fontBold)
  drawHeaderBanner(page, {
    title: 'Sample Revenue Board',
    subtitle: 'Taxpayer Identification Number (TIN) Certificate',
    pageInfo: ''
  }, fontBold, fontRegular)

  let y = 710
  page.drawText('TIN CERTIFICATE', { x: 230, y, size: 15, font: fontBold, color: TEXT_BLACK })
  y -= 45

  const fields = [
    { label: 'TIN', val: '1234-5678-9012' },
    { label: 'Taxpayer Name', val: 'Meghna Tech Solutions Ltd.' },
    { label: 'Taxpayer Status', val: 'Company' },
    { label: 'Registered Address', val: 'House 12, Road 5, Sample Town, Dhaka' },
    { label: 'Tax Circle / Zone', val: 'Circle 21, Zone 4 (Sample)' },
    { label: 'Date of Issue', val: '2019-03-14' }
  ]

  for (const f of fields) {
    page.drawText(f.label, { x: 40, y, size: 10, font: fontBold, color: TEXT_BLACK })
    page.drawText(f.val, { x: 190, y, size: 10, font: fontRegular, color: TEXT_BLACK })
    y -= 24
  }

  y -= 15
  page.drawText('This certificate confirms the Taxpayer Identification Number of the company named above. It does not', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })
  y -= 15
  page.drawText('have an expiry date.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })

  drawSignature(page, 40, 200, 'Deputy Commissioner of Taxes', 'Sample Revenue Board', fontBold, fontRegular)

  return await doc.save()
}

// ----------------------------------------------------------------------
// 3. TECHNICAL PROPOSAL (6 pages)
// ----------------------------------------------------------------------
async function buildTechnicalProposal() {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const pagesInfo = [
    { title: '1. Cover Letter', pNum: 1 },
    { title: '2. Scope of Supply', pNum: 2 },
    { title: '3. Technical Compliance', pNum: 3 },
    { title: '4. Delivery and Installation Schedule', pNum: 4 },
    { title: '5. Warranty and After-Sales Support', pNum: 5 },
    { title: '6. Project Team', pNum: 6 }
  ]

  for (let i = 0; i < 6; i++) {
    const page = doc.addPage([595.28, 841.89])
    drawWatermark(page, fontBold)
    drawHeaderBanner(page, {
      title: 'Meghna Tech Solutions Ltd.',
      subtitle: 'Technical Proposal - Tender T-2026-0417',
      pageInfo: `Page ${i + 1} of 6`
    }, fontBold, fontRegular)

    let y = 720
    const info = pagesInfo[i]
    page.drawText(info.title, { x: 40, y, size: 13, font: fontBold, color: rgb(0.1, 0.3, 0.6) })
    y -= 25

    if (i === 0) {
      page.drawText('To: The Director, Directorate of Sample Services.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 20
      page.drawText('Subject: Technical proposal for Tender T-2026-0417, Supply of IT Equipment.', { x: 40, y, size: 9.5, font: fontBold, color: TEXT_BLACK }); y -= 20
      page.drawText('Meghna Tech Solutions Ltd. is pleased to submit this technical proposal. We have read the tender', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 15
      page.drawText('documents carefully and offer to supply, install and support the equipment listed in this proposal, in full', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 15
      page.drawText('compliance with the technical specifications.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 20
      page.drawText('We confirm that this offer is valid for 120 days from the submission deadline.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK })
    } else if (i === 1) {
      page.drawText('The scope covers the supply, delivery, installation, testing and commissioning of IT equipment at the', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 15
      page.drawText('main office of the procuring entity, followed by training and warranty support.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 25

      page.drawRectangle({ x: 40, y: y - 5, width: 515.28, height: 20, color: LIGHT_BG })
      page.drawText('Lot', { x: 48, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Description', { x: 120, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Qty', { x: 460, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      y -= 20

      const lots = [
        ['1', 'Desktop computer, Core i7, 16 GB RAM', '60'],
        ['2', 'Laptop computer, 14 inch', '25'],
        ['3', 'Network laser printer', '8'],
        ['4', 'Online UPS, 1 kVA', '60'],
        ['5', 'Managed network switch, 24 port', '4']
      ]
      for (const [lot, desc, qty] of lots) {
        page.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 0.5, color: BORDER_COLOR })
        page.drawText(lot, { x: 48, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(desc, { x: 120, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(qty, { x: 460, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        y -= 22
      }
    } else if (i === 2) {
      page.drawText('All offered items meet or exceed the required specifications. A summary is shown below. Detailed', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 15
      page.drawText('manufacturer datasheets are available on request.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 25

      page.drawRectangle({ x: 40, y: y - 5, width: 515.28, height: 20, color: LIGHT_BG })
      page.drawText('Item', { x: 48, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Required', { x: 190, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Offered', { x: 360, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      y -= 20

      const specs = [
        ['Processor', 'Core i5 or better', 'Core i7, 13th gen'],
        ['Memory', '8 GB or more', '16 GB DDR5'],
        ['Storage', '512 GB SSD', '512 GB NVMe SSD'],
        ['Warranty', '3 years', '3 years on-site']
      ]
      for (const [item, req, off] of specs) {
        page.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 0.5, color: BORDER_COLOR })
        page.drawText(item, { x: 48, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(req, { x: 190, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(off, { x: 360, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        y -= 22
      }
    } else if (i === 3) {
      page.drawText('Delivery will be completed within 45 days of signing the contract.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 25
      page.drawRectangle({ x: 40, y: y - 5, width: 515.28, height: 20, color: LIGHT_BG })
      page.drawText('Step', { x: 48, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Activity', { x: 120, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Days', { x: 460, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      y -= 20

      const sched = [
        ['1', 'Delivery of all items', '1-30'],
        ['2', 'Installation and testing', '31-40'],
        ['3', 'Training and handover', '41-45']
      ]
      for (const [st, act, days] of sched) {
        page.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 0.5, color: BORDER_COLOR })
        page.drawText(st, { x: 48, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(act, { x: 120, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(days, { x: 460, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        y -= 22
      }
    } else if (i === 4) {
      page.drawText('All equipment comes with a three-year on-site warranty. Our support team will respond to any fault', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 15
      page.drawText('report within 24 hours and repair or replace faulty items within 72 hours.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 20
      page.drawText('A dedicated support phone line and email will be provided to the procuring entity.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK })
    } else if (i === 5) {
      page.drawText('The project will be managed by an experienced team with similar past projects.', { x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK }); y -= 25
      page.drawRectangle({ x: 40, y: y - 5, width: 515.28, height: 20, color: LIGHT_BG })
      page.drawText('Role', { x: 48, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Name', { x: 220, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      page.drawText('Experience', { x: 420, y, size: 8.5, font: fontBold, color: TEXT_BLACK })
      y -= 20

      const team = [
        ['Project Manager', 'Ms. Nadia Karim', '12 years'],
        ['Lead Engineer', 'Mr. Tanvir Ahmed', '9 years'],
        ['Support Engineer', 'Mr. Sajid Rahman', '5 years']
      ]
      for (const [role, name, exp] of team) {
        page.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 555.28, y: y + 12 }, thickness: 0.5, color: BORDER_COLOR })
        page.drawText(role, { x: 48, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(name, { x: 220, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        page.drawText(exp, { x: 420, y, size: 8.5, font: fontRegular, color: TEXT_BLACK })
        y -= 22
      }

      drawSignature(page, 40, 200, 'Rafiq Hasan', 'Managing Director, Meghna Tech Solutions Ltd.', fontBold, fontRegular)
    }
  }

  return await doc.save()
}

// ----------------------------------------------------------------------
// 4. BANK SOLVENCY CERTIFICATE (1 page)
// ----------------------------------------------------------------------
async function buildBankSolvencyCertificate() {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const page = doc.addPage([595.28, 841.89])
  drawWatermark(page, fontBold)
  drawHeaderBanner(page, {
    bannerColor: GREEN_BANNER,
    title: 'Sample Commercial Bank PLC',
    subtitle: 'Sample Town Branch',
    pageInfo: ''
  }, fontBold, fontRegular)

  let y = 710
  page.drawText('Ref: SCB/STB/SOL/2026/0981', { x: 40, y, size: 9, font: fontRegular, color: TEXT_BLACK })
  page.drawText('Date: 2026-09-01', { x: 450, y, size: 9, font: fontRegular, color: TEXT_BLACK })
  y -= 45

  page.drawText('BANK SOLVENCY CERTIFICATE', { x: 170, y, size: 14, font: fontBold, color: TEXT_BLACK })
  y -= 40

  page.drawText('This is to certify that Meghna Tech Solutions Ltd., House 12, Road 5, Sample Town, Dhaka, maintains', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  }); y -= 16
  page.drawText('Current Account No. 0000-000-0000 (sample) with our branch. To the best of our knowledge, the', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  }); y -= 16
  page.drawText('company is financially solvent and able to meet commitments up to BDT 5,00,00,000 (Five Crore Taka).', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  }); y -= 25

  page.drawText('This certificate is issued at the request of the account holder for tender purposes, without any risk or', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  }); y -= 16
  page.drawText('responsibility on the part of the bank or its officers.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  }); y -= 45

  // EXPIRY HIGHLIGHT BOX
  page.drawRectangle({
    x: 40,
    y: y - 10,
    width: 515.28,
    height: 38,
    color: rgb(0.92, 0.97, 0.94),
    borderColor: rgb(0.5, 0.8, 0.6),
    borderWidth: 1
  })

  page.drawText('VALID UNTIL (EXPIRY DATE):  31 December 2026  (2026-12-31)', {
    x: 60,
    y: y + 5,
    size: 11.5,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.15)
  })

  drawSignature(page, 40, 200, 'Branch Manager', 'Sample Commercial Bank PLC', fontBold, fontRegular)

  return await doc.save()
}

// ----------------------------------------------------------------------
// 5. VAT REGISTRATION CERTIFICATE (1 page)
// ----------------------------------------------------------------------
async function buildVatCertificate() {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const page = doc.addPage([595.28, 841.89])
  drawWatermark(page, fontBold)
  drawHeaderBanner(page, {
    title: 'Sample Revenue Board',
    subtitle: 'VAT Registration Certificate',
    pageInfo: ''
  }, fontBold, fontRegular)

  let y = 710
  page.drawText('VAT REGISTRATION CERTIFICATE', { x: 160, y, size: 14, font: fontBold, color: TEXT_BLACK })
  y -= 45

  const fields = [
    { label: 'Business ID (BIN)', val: '000123456-0101' },
    { label: 'Name of Entity', val: 'Meghna Tech Solutions Ltd.' },
    { label: 'Address', val: 'House 12, Road 5, Sample Town, Dhaka' },
    { label: 'Type of Activity', val: 'Supply, Service' },
    { label: 'Effective Date', val: '2019-04-01' }
  ]

  for (const f of fields) {
    page.drawText(f.label, { x: 40, y, size: 10, font: fontBold, color: TEXT_BLACK })
    page.drawText(f.val, { x: 200, y, size: 10, font: fontRegular, color: TEXT_BLACK })
    y -= 24
  }

  y -= 15
  page.drawText('The entity named above is registered for Value Added Tax. This registration remains in force until it is', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })
  y -= 15
  page.drawText('cancelled. It does not have an expiry date.', {
    x: 40, y, size: 9.5, font: fontRegular, color: TEXT_BLACK
  })

  drawSignature(page, 40, 200, 'Assistant Commissioner', 'Sample Revenue Board', fontBold, fontRegular)

  return await doc.save()
}

// ----------------------------------------------------------------------
// MAIN GENERATION RUNNER
// ----------------------------------------------------------------------
async function run() {
  const baseDir = path.resolve('public', 'sample-pack')
  const docsDir = path.join(baseDir, 'documents')

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  console.log('Generating official sample PDFs from user specification...')

  const finBytes = await buildFinancialProposal()
  fs.writeFileSync(path.join(docsDir, 'Financial_Proposal.pdf'), finBytes)
  console.log('  ✓ Financial_Proposal.pdf (2 pages)')

  const tinBytes = await buildTinCertificate()
  fs.writeFileSync(path.join(docsDir, 'TIN_Certificate.pdf'), tinBytes)
  console.log('  ✓ TIN_Certificate.pdf (1 page)')

  const techBytes = await buildTechnicalProposal()
  fs.writeFileSync(path.join(docsDir, 'Technical_Proposal.pdf'), techBytes)
  console.log('  ✓ Technical_Proposal.pdf (6 pages)')

  const bankBytes = await buildBankSolvencyCertificate()
  fs.writeFileSync(path.join(docsDir, 'Bank_Solvency_Certificate.pdf'), bankBytes)
  console.log('  ✓ Bank_Solvency_Certificate.pdf (1 page)')

  const vatBytes = await buildVatCertificate()
  fs.writeFileSync(path.join(docsDir, 'VAT_Registration_Certificate.pdf'), vatBytes)
  console.log('  ✓ VAT_Registration_Certificate.pdf (1 page)')

  // Duplicate file trap (identical hash as Bank Solvency)
  fs.writeFileSync(path.join(docsDir, 'Bank_Solvency_Copy.pdf'), bankBytes)
  console.log('  ✓ Bank_Solvency_Copy.pdf (Duplicate content trap)')

  // Non-PDF trap
  fs.writeFileSync(path.join(docsDir, 'submission_checklist.txt'), 'This is a text file trap to test non-PDF rejection.')
  console.log('  ✓ submission_checklist.txt (Non-PDF trap)')

  // Create requirements.json matching this exact sample pack!
  const reqData = {
    tender: {
      tender_id: 'T-2026-0417',
      title: 'Supply of IT Equipment',
      procuring_entity: 'Directorate of Sample Services',
      bidder: 'Meghna Tech Solutions Ltd.',
      submission_deadline: '2026-10-20'
    },
    requirements: [
      { id: 'R01', order: 1, title_en: 'Technical Proposal', title_bn: 'কারিগরি প্রস্তাবনা', mandatory: true, has_expiry: false },
      { id: 'R02', order: 2, title_en: 'Financial Proposal', title_bn: 'আর্থিক প্রস্তাবনা', mandatory: true, has_expiry: false },
      { id: 'R03', order: 3, title_en: 'Bank Solvency Certificate', title_bn: 'ব্যাংক স্বচ্ছলতা সনদ', mandatory: true, has_expiry: true },
      { id: 'R04', order: 4, title_en: 'TIN Certificate', title_bn: 'টিআইএন সার্টিফিকেট', mandatory: true, has_expiry: false },
      { id: 'R05', order: 5, title_en: 'VAT Registration Certificate', title_bn: 'ভ্যাট নিবন্ধন সনদ', mandatory: true, has_expiry: false }
    ]
  }

  fs.writeFileSync(path.join(baseDir, 'requirements.json'), JSON.stringify(reqData, null, 2))
  console.log('  ✓ public/sample-pack/requirements.json created!')

  console.log('🎉 Sample pack PDFs successfully generated and saved to public/sample-pack/documents/ !')
}

run().catch(console.error)
