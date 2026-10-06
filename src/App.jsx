import React from 'react'
import Header from './components/Header.jsx'
import { useLang } from './i18n/index.jsx'

export default function App() {
  const { t } = useLang()

  return (
    <div className="app-container">
      <Header />
      <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>{t('app.title')}</h2>
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>{t('empty.start')}</p>
      </div>
    </div>
  )
}
