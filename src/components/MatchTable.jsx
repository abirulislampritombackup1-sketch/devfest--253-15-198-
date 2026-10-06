import React from 'react'
import { useLang } from '../i18n/index.jsx'
import { STATUS_CODES } from '../logic/status.js'

export default function MatchTable({
  requirements = [],
  files = [],
  matches = {},
  expiry = {},
  statuses = {},
  duplicateGroups = new Map(),
  onMatchChange,
  onExpiryChange
}) {
  const { lang, t } = useLang()

  if (!requirements.length) return null

  // Build reverse index: fileId -> reqId
  const fileToReqMap = new Map()
  Object.entries(matches).forEach(([reqId, fId]) => {
    if (fId) fileToReqMap.set(fId, reqId)
  })

  // Find all hashes of matched files to prevent matching duplicates to different docs
  const matchedHashes = new Map() // hash -> fileId matched
  Object.entries(matches).forEach(([, fId]) => {
    const f = files.find(item => item.id === fId)
    if (f && f.hash) {
      matchedHashes.set(f.hash, fId)
    }
  })

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case STATUS_CODES.OK:
        return <span className="badge badge-ok">✓ {t('status.OK')}</span>
      case STATUS_CODES.MISSING:
        return <span className="badge badge-missing">✕ {t('status.MISSING')}</span>
      case STATUS_CODES.EXPIRY_NEEDED:
        return <span className="badge badge-expiry">⚠ {t('status.EXPIRY_NEEDED')}</span>
      case STATUS_CODES.EXPIRED:
        return <span className="badge badge-expired">⊘ {t('status.EXPIRED')}</span>
      case STATUS_CODES.NOT_PROVIDED:
        return <span className="badge badge-optional">— {t('status.NOT_PROVIDED')}</span>
      default:
        return null
    }
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span className="step-num">3</span>
          <span>{t('step.match')}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>{t('col.order')}</th>
              <th>{t('col.document')}</th>
              <th style={{ width: '110px' }}>{t('col.type')}</th>
              <th style={{ minWidth: '220px' }}>{t('col.file')}</th>
              <th style={{ width: '160px' }}>{t('col.expiry')}</th>
              <th style={{ width: '160px' }}>{t('col.status')}</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => {
              const currentMatchedFileId = matches[req.id] || ''
              const docTitle = lang === 'bn' ? (req.title_bn || req.title_en) : req.title_en
              const reqStatus = statuses[req.id]
              const showExpiryInput = req.has_expiry && Boolean(currentMatchedFileId)

              return (
                <tr key={req.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{req.order}</td>
                  <td style={{ fontWeight: 600 }}>
                    {docTitle}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ID: {req.id}
                    </div>
                  </td>
                  <td>
                    {req.mandatory ? (
                      <span className="badge badge-mandatory">{t('type.mandatory')}</span>
                    ) : (
                      <span className="badge badge-optional">{t('type.optional')}</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="select-input"
                      value={currentMatchedFileId}
                      onChange={(e) => onMatchChange(req.id, e.target.value)}
                    >
                      <option value="">{t('match.none')}</option>
                      {files.map((file) => {
                        const isAssignedToOther = fileToReqMap.has(file.id) && fileToReqMap.get(file.id) !== req.id
                        
                        // Check duplicate lock
                        const activeMatchedFileWithSameHash = matchedHashes.get(file.hash)
                        const isDuplicateLocked = activeMatchedFileWithSameHash && 
                                                  activeMatchedFileWithSameHash !== file.id && 
                                                  fileToReqMap.get(activeMatchedFileWithSameHash) !== req.id

                        const disabled = isAssignedToOther || isDuplicateLocked

                        let label = file.name
                        if (isAssignedToOther) {
                          label += ` (${t('match.alreadyUsed')})`
                        } else if (isDuplicateLocked) {
                          label += ` (${t('match.duplicateLocked', { name: files.find(f => f.id === activeMatchedFileWithSameHash)?.name || '' })})`
                        }

                        return (
                          <option key={file.id} value={file.id} disabled={disabled}>
                            {label}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                  <td>
                    {showExpiryInput ? (
                      <input
                        type="date"
                        className="date-input"
                        value={expiry[req.id] || ''}
                        onChange={(e) => onExpiryChange(req.id, e.target.value)}
                        placeholder="YYYY-MM-DD"
                      />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>{getStatusBadge(reqStatus)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
