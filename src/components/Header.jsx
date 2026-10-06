import React from 'react'
import { useLang } from '../i18n/index.jsx'

export default function Header({ theme = 'light', onToggleTheme }) {
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

      <div className="header-controls">
        <button 
          type="button" 
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          aria-label={t('theme.toggle')}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

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
      </div>
    </header>
  )
}
