import fs from 'fs'
import path from 'path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { buildTenderPackagePdf } from '../src/logic/buildPackage.js'

async function createSamplePdf(title, pageCount = 1) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595.28, 841.89])
    
    // Header border box
    page.drawRectangle({
      x: 40,
      y: 720,
      width: 515.28,
      height: 70,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 1.5,
      color: rgb(0.96, 0.98, 1)
    })

    page.drawText(title, {
      x: 55,
      y: 755,
      size: 16,
      font,
      color: rgb(0.1, 0.2, 0.5)
    })

    page.drawText(`Official Document Page ${i + 1} of ${pageCount}`, {
      x: 55,
      y: 735,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45)
    })

    // Simulated content body
    page.drawText('This is a verified document submitted for tender evaluation.', {
      x: 40,
      y: 670,
      size: 12,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    })

    page.drawText('All details contained herein are authentic and valid under applicable regulations.', {
      x: 40,
      y: 645,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    })
  }

  return await doc.save()
}

async function run() {
  console.log('Generating verified sample pack output...')

  const tender = {
    tender_id: 'T-2026-0417',
    title: 'Supply of IT Equipment and Networking Hardware',
    procuring_entity: 'Directorate General of Information Technology',
    bidder: 'NexGen Solutions Ltd.',
    submission_deadline: '2026-10-20'
  }

  const requirements = [
    { id: 'R01', order: 1, title_en: 'Trade License', title_bn: 'ট্রেড লাইসেন্স', mandatory: true, has_expiry: true },
    { id: 'R02', order: 2, title_en: 'TIN & Tax Clearance Certificate', title_bn: 'টিআইএন এবং আয়কর সনদ', mandatory: true, has_expiry: true },
    { id: 'R03', order: 3, title_en: 'Bank Solvency Certificate', title_bn: 'ব্যাংক স্বচ্ছলতা সনদ', mandatory: true, has_expiry: false },
    { id: 'R04', order: 4, title_en: 'Manufacturer Authorization Letter', title_bn: 'উত্পাদক প্রতিষ্ঠানের অনুমোদন পত্র', mandatory: true, has_expiry: false },
    { id: 'R05', order: 5, title_en: 'ISO Quality Certification', title_bn: 'আইএসও মান সনদ', mandatory: false, has_expiry: true }
  ]

  // Create sample document bytes
  const bytesR1 = await createSamplePdf('Trade License (2026-2027)', 2)
  const bytesR2 = await createSamplePdf('TIN & Tax Clearance 2026', 1)
  const bytesR3 = await createSamplePdf('Bank Solvency Certificate', 2)
  const bytesR4 = await createSamplePdf('Manufacturer Authorization Form', 1)
  const bytesR5 = await createSamplePdf('ISO 9001:2015 Quality Certificate', 1)

  const filesMap = new Map([
    ['f1', { id: 'f1', name: 'R01_Trade_License.pdf', pages: 2, bytes: bytesR1 }],
    ['f2', { id: 'f2', name: 'R02_Tax_Clearance.pdf', pages: 1, bytes: bytesR2 }],
    ['f3', { id: 'f3', name: 'R03_Bank_Solvency.pdf', pages: 2, bytes: bytesR3 }],
    ['f4', { id: 'f4', name: 'R04_Manufacturer_Auth.pdf', pages: 1, bytes: bytesR4 }],
    ['f5', { id: 'f5', name: 'R05_ISO_Certificate.pdf', pages: 1, bytes: bytesR5 }]
  ])

  const matches = {
    R01: 'f1',
    R02: 'f2',
    R03: 'f3',
    R04: 'f4',
    R05: 'f5'
  }

  const finalPdfBytes = await buildTenderPackagePdf({
    tender,
    requirements,
    matches,
    filesMap
  })

  const outputDir = path.resolve('output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outPath = path.join(outputDir, `${tender.tender_id}_Package.pdf`)
  fs.writeFileSync(outPath, finalPdfBytes)

  const checkDoc = await PDFDocument.load(finalPdfBytes)
  console.log(`✅ Successfully generated: ${outPath}`)
  console.log(`📄 Total pages in compiled package: ${checkDoc.getPageCount()} (1 cover + 7 document pages)`)
}

run().catch(console.error)
