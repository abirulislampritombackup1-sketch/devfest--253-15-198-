import React from 'react'
import { useLang } from '../i18n/index.jsx'

export default function Header() {
  const { lang, setLang, t } = useLang()

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'bn' : 'en')
  }

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div className="brand-text">
          <h1>{t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>
        </div>
      </div>

      <button 
        type="button" 
        className="lang-toggle-btn" 
        onClick={toggleLanguage}
        title={t('lang.switch')}
        aria-label={t('lang.switch')}
      >
        <span>{lang === 'en' ? 'English' : 'বাংলা'}</span>
        <span className="lang-badge">{lang === 'en' ? 'EN' : 'বাং'}</span>
      </button>
    </header>
  )
}
