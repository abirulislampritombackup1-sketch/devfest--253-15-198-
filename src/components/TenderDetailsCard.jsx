import React, { useRef } from 'react'
import { useLang } from '../i18n/index.jsx'
import { validateRequirements } from '../logic/validateRequirements.js'

export default function TenderDetailsCard({ 
  tender, 
  requirementsCount, 
  hasExistingWork, 
  onLoadRequirements, 
  onError 
}) {
  const { t } = useLang()
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (hasExistingWork) {
      const confirmReset = window.confirm(
        'Loading a new requirements file will reset existing matches and expiry dates. Continue?'
      )
      if (!confirmReset) {
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
    }

    try {
      const text = await file.text()
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        onError('error.badJson')
        return
      }

      const result = validateRequirements(parsed)
      if (!result.valid) {
        onError('error.badJson', { details: result.errors.join('; ') })
        return
      }

      onLoadRequirements(result.data.tender, result.data.requirements)
    } catch {
      onError('error.badJson')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLoadSampleDemo = async () => {
    if (hasExistingWork) {
      const confirmReset = window.confirm('Reset current work and load demo sample?')
      if (!confirmReset) return
    }

    try {
      const res = await fetch('/sample-pack/requirements.json')
      if (res.ok) {
        const json = await res.json()
        const result = validateRequirements(json)
        if (result.valid) {
          onLoadRequirements(result.data.tender, result.data.requirements)
          return
        }
      }
    } catch {
      // fallback to inline data
    }

    const demoData = {
      tender: {
        tender_id: 'T-2026-0417',
        title: 'Supply of IT Equipment',
        procuring_entity: 'Directorate of Sample Services',
        bidder: 'Meghna Tech Solutions Ltd.',
        submission_deadline: '2026-10-20'
      },
      requirements: [
        { id: 'R01', order: 1, title_en: 'Technical Proposal', title_bn: 'কারিগরি প্রস্তাবনা', mandatory: true, has_expiry: false },
        { id: 'R02', order: 2, title_en: 'Financial Proposal', title_bn: 'আর্থিক প্রস্তাবনা', mandatory: true, has_expiry: false },
        { id: 'R03', order: 3, title_en: 'Bank Solvency Certificate', title_bn: 'ব্যাংক স্বচ্ছলতা সনদ', mandatory: true, has_expiry: true },
        { id: 'R04', order: 4, title_en: 'TIN Certificate', title_bn: 'টিআইএন সার্টিফিকেট', mandatory: true, has_expiry: false },
        { id: 'R05', order: 5, title_en: 'VAT Registration Certificate', title_bn: 'ভ্যাট নিবন্ধন সনদ', mandatory: true, has_expiry: false }
      ]
    }
    const result = validateRequirements(demoData)
    if (result.valid) {
      onLoadRequirements(result.data.tender, result.data.requirements)
    }
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span className="step-num">1</span>
          <span>{t('step.tender')}</span>
        </div>
        <div className="toolbar-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json,application/json" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>{t('btn.loadReq')}</span>
          </button>
          {!tender && (
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleLoadSampleDemo}
            >
              <span>{t('btn.loadSample')}</span>
            </button>
          )}
        </div>
      </div>

      {tender ? (
        <div className="tender-meta-grid">
          <div className="meta-item">
            <span className="meta-label">{t('tender.id')}</span>
            <span className="meta-val">
              <span className="meta-badge">{tender.tender_id}</span>
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t('tender.title')}</span>
            <span className="meta-val">{tender.title}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t('tender.entity')}</span>
            <span className="meta-val">{tender.procuring_entity}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t('tender.bidder')}</span>
            <span className="meta-val">{tender.bidder}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t('tender.deadline')}</span>
            <span className="meta-val" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {tender.submission_deadline}
            </span>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
          {t('empty.start')}
        </p>
      )}
    </div>
  )
}
