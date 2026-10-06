import React from 'react'
import { useLang } from '../i18n/index.jsx'

export default function NoticeList({ notices = [], onDismiss }) {
  const { t } = useLang()

  if (!notices.length) return null

  return (
    <div className="notices-container" style={{ marginBottom: '18px' }}>
      {notices.map((n) => (
        <div 
          key={n.id} 
          className={`notice-box ${n.type === 'error' ? 'notice-error' : 'notice-info'}`}
        >
          <span>
            {n.code ? t(n.code, n.params) : n.message}
          </span>
          <button 
            type="button" 
            className="notice-btn"
            onClick={() => onDismiss(n.id)}
          >
            {t('notices.dismiss')}
          </button>
        </div>
      ))}
    </div>
  )
}
