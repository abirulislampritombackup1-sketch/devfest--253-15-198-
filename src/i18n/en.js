export default {
  // App Header
  'app.title': 'Tender Document Package Builder',
  'app.subtitle': 'Assemble, validate, and compile official tender submission packages',
  'lang.switch': 'Language',
  'theme.toggle': 'Toggle night/day mode',
  'theme.dark': 'Night mode',
  'theme.light': 'Day mode',

  // Workflow Steps
  'step.tender': '1. Load tender requirements',
  'step.upload': '2. Upload PDF files',
  'step.match': '3. Match files and check',
  'step.generate': '4. Generate package',

  // Buttons & Actions
  'btn.loadReq': 'Load requirements.json',
  'btn.loadSample': 'Load Sample Pack',
  'btn.chooseFiles': 'Choose PDF files',
  'btn.loadSamplePdfs': 'Load Sample PDFs',
  'upload.drop': 'Drag and drop PDF files here, or click to browse',
  'upload.hint': 'Only valid PDF files accepted. Max 30 files, 50 MB total.',
  'btn.remove': 'Remove',
  'btn.clear': 'Clear match',
  'btn.generate': 'Generate package',
  'btn.download': 'Download package',
  'btn.preview': 'Open in new tab',
  'btn.autoMatch': 'Auto-match files',
  'btn.exportCsv': 'Export checklist CSV',
  'btn.close': 'Close',

  // Tender Card
  'tender.details': 'Tender Details',
  'tender.id': 'Tender ID',
  'tender.title': 'Title',
  'tender.entity': 'Procuring entity',
  'tender.bidder': 'Bidder',
  'tender.deadline': 'Submission deadline',

  // Table Columns
  'col.order': 'No.',
  'col.document': 'Document',
  'col.type': 'Type',
  'col.file': 'Matched file',
  'col.expiry': 'Expiry date',
  'col.status': 'Status',
  'col.pages': 'Pages',
  'col.name': 'File name',
  'col.size': 'Size',
  'col.actions': 'Actions',

  // Types
  'type.mandatory': 'Mandatory',
  'type.optional': 'Optional',

  // Matching options
  'match.none': '— Select a file —',
  'match.alreadyUsed': 'Already assigned',
  'match.duplicateLocked': 'Duplicate locked ({name})',

  // Status Codes
  'status.MISSING': 'Missing',
  'status.EXPIRY_NEEDED': 'Expiry date needed',
  'status.EXPIRED': 'Expired',
  'status.NOT_PROVIDED': 'Not provided',
  'status.OK': 'OK',

  // Duplicate badge
  'file.duplicate': 'Duplicate of {name}',
  'file.pagesCount': '{count} pages',

  // Summary Bar & Reasons
  'summary.ready': 'Ready to generate package',
  'summary.problems': '{n} problem(s) must be fixed before generating',
  'summary.documentsCount': '{matched} of {total} requirements matched',
  'reason.MISSING': '{doc}: required file is missing',
  'reason.EXPIRY_NEEDED': '{doc}: enter the expiry date',
  'reason.EXPIRED': '{doc}: expired before the deadline',

  // Messages & Errors
  'error.notPdf': '"{name}" is not a PDF and was rejected',
  'error.damaged': '"{name}" is damaged or cannot be read',
  'error.encrypted': '"{name}" is password-protected',
  'error.limitFiles': 'Maximum 30 files allowed',
  'error.limitSize': 'Total size must be 50 MB or less',
  'error.badJson': 'requirements.json is not valid or missing required fields',
  'error.generate': 'Could not create the package PDF',
  'info.generating': 'Creating package PDF…',
  'info.done': 'Package ready ({pages} pages)',
  'empty.start': 'Start by loading requirements.json',
  'empty.noFiles': 'No PDF files uploaded yet',
  'notices.dismiss': 'Dismiss',
  'autoMatch.done': 'Auto-matched {count} document(s) by filename'
}
