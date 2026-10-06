import React from 'react'
import { useLang } from '../i18n/index.jsx'

export default function BonusToolbar({
  hasRequirements = false,
  hasFiles = false,
  onAutoMatch,
  onExportCsv,
  onClearMatches
}) {
  const { t } = useLang()

  if (!hasRequirements) return null

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
      {hasFiles && (
        <button
          type="button"
          className="btn btn-outline"
          onClick={onAutoMatch}
          title="Automatically suggest matches based on filenames"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{t('btn.autoMatch')}</span>
        </button>
      )}

      <button
        type="button"
        className="btn btn-outline"
        onClick={onExportCsv}
        title="Download compliance status report as CSV"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>{t('btn.exportCsv')}</span>
      </button>

      <button
        type="button"
        className="btn btn-outline"
        onClick={onClearMatches}
        title="Reset all matches"
      >
        <span>{t('btn.clear')}</span>
      </button>
    </div>
  )
}
