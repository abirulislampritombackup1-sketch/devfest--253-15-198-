/**
 * Generates and downloads a compliance checklist CSV file with UTF-8 BOM.
 * @param {object} params
 * @param {object} params.tender
 * @param {object[]} params.requirements
 * @param {Record<string, string>} params.matches
 * @param {Record<string, string>} params.expiry
 * @param {Record<string, string>} params.statuses
 * @param {Map<string, object>} params.filesMap
 * @param {string} params.lang
 * @param {function} params.t
 */
export function exportChecklistCsv({
  tender,
  requirements = [],
  matches = {},
  expiry = {},
  statuses = {},
  filesMap = new Map(),
  lang = 'en',
  t
}) {
  const headers = [
    t('col.order'),
    'Requirement ID',
    t('col.document'),
    t('col.type'),
    t('col.file'),
    t('col.pages'),
    t('col.expiry'),
    t('col.status')
  ]

  const rows = requirements.map((req) => {
    const fileId = matches[req.id]
    const file = fileId ? filesMap.get(fileId) : null
    const docTitle = lang === 'bn' ? (req.title_bn || req.title_en) : req.title_en
    const typeLabel = req.mandatory ? t('type.mandatory') : t('type.optional')
    const fileName = file ? file.name : ''
    const pageCount = file ? String(file.pages) : ''
    const expiryVal = expiry[req.id] || ''
    const statusCode = statuses[req.id] || ''
    const statusLabel = statusCode ? t(`status.${statusCode}`) : ''

    return [
      req.order,
      req.id,
      docTitle,
      typeLabel,
      fileName,
      pageCount,
      expiryVal,
      statusLabel
    ]
  })

  // Format CSV rows, escaping double quotes
  const formatCell = (val) => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvContent = [
    headers.map(formatCell).join(','),
    ...rows.map(r => r.map(formatCell).join(','))
  ].join('\r\n')

  // UTF-8 BOM (\uFEFF) ensures Excel renders Bengali and unicode correctly
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const tenderId = tender?.tender_id || 'Tender'
  const link = document.createElement('a')
  link.href = url
  link.download = `${tenderId}_Checklist.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
