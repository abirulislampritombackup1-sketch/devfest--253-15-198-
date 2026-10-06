import React, { useState } from 'react'
import { useLang } from '../i18n/index.jsx'

export default function SummaryStickyBar({
  canGenerate = false,
  blockingProblems = [],
  totalRequirements = 0,
  matchedCount = 0,
  isGenerating = false,
  onGenerate
}) {
  const { lang, t } = useLang()
  const [showDrawer, setShowDrawer] = useState(false)

  if (totalRequirements === 0) return null

  const problemCount = blockingProblems.length

  return (
    <>
      {showDrawer && problemCount > 0 && (
        <div 
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '20px',
            right: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '12px 12px 0 0',
            border: '1px solid var(--border-color)',
            borderBottom: 'none',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
            zIndex: 99,
            padding: '18px 24px',
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: 'var(--status-missing)', fontSize: '15px' }}>
              {t('summary.problems', { n: problemCount })}
            </h4>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '2px 8px', fontSize: '12px' }}
              onClick={() => setShowDrawer(false)}
            >
              {t('btn.close')}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blockingProblems.map((p, idx) => {
              const docName = lang === 'bn' ? p.titleBn : p.titleEn
              const reasonKey = `reason.${p.status}`
              return (
                <li 
                  key={idx} 
                  style={{ 
                    padding: '6px 0', 
                    fontSize: '13px', 
                    color: 'var(--text-main)', 
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ color: 'var(--status-missing)', fontWeight: 'bold' }}>•</span>
                  <span>{t(reasonKey, { doc: docName })}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="sticky-summary">
        <div className="sticky-inner">
          <div className="summary-info">
            <div className="summary-indicator">
              <span className={`indicator-dot ${canGenerate ? 'dot-ready' : 'dot-blocked'}`}></span>
              <span>
                {canGenerate 
                  ? t('summary.ready')
                  : t('summary.problems', { n: problemCount })
                }
              </span>
            </div>
            {!canGenerate && problemCount > 0 && (
              <button 
                type="button" 
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setShowDrawer(!showDrawer)}
              >
                {showDrawer ? '▲ Hide details' : '▼ View reasons'}
              </button>
            )}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              ({t('summary.documentsCount', { matched: matchedCount, total: totalRequirements })})
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            disabled={!canGenerate || isGenerating}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <>
                <div className="spinner"></div>
                <span>{t('info.generating')}</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>{t('btn.generate')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
