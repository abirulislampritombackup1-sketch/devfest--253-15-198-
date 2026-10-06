import React from 'react'
import { useLang } from '../i18n/index.jsx'

export default function PackageModal({
  generatedPackage,
  onClose
}) {
  const { t } = useLang()

  if (!generatedPackage) return null

  const { blobUrl, fileName, pages } = generatedPackage

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    window.open(blobUrl, '_blank')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">🎉</div>
        <h3 className="modal-title">{t('info.done', { pages })}</h3>
        <p className="modal-text">
          <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{fileName}</span>
          <br />
          <span>The tender submission package PDF has been successfully generated and checked.</span>
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleDownload}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>{t('btn.download')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={handlePreview}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>{t('btn.preview')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '6px' }}
            onClick={onClose}
          >
            {t('btn.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
