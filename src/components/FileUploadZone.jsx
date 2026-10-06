import React, { useRef, useState } from 'react'
import { useLang } from '../i18n/index.jsx'
import { verifyPdfFile, checkFileLimits } from '../logic/fileChecks.js'
import { computeSha256, getFileDuplicateInfo } from '../logic/duplicates.js'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function FileUploadZone({ 
  files = [], 
  duplicateGroups = new Map(), 
  onAddFiles, 
  onRemoveFile, 
  onError 
}) {
  const { t } = useLang()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const processFileList = async (fileList) => {
    if (!fileList || !fileList.length) return

    const currentCount = files.length
    const currentSize = files.reduce((acc, f) => acc + f.size, 0)

    const incomingFiles = Array.from(fileList)
    const incomingSize = incomingFiles.reduce((acc, f) => acc + f.size, 0)

    // Check limits upfront
    const limitCheck = checkFileLimits(currentCount, currentSize, incomingFiles.length, incomingSize)
    if (!limitCheck.valid) {
      onError(limitCheck.error)
      return
    }

    const processed = []

    for (const rawFile of incomingFiles) {
      // 1. Basic extension / MIME check
      const lowerName = rawFile.name.toLowerCase()
      if (!lowerName.endsWith('.pdf') && rawFile.type && rawFile.type !== 'application/pdf') {
        onError('error.notPdf', { name: rawFile.name })
        continue
      }

      try {
        const arrayBuffer = await rawFile.arrayBuffer()
        const uint8Bytes = new Uint8Array(arrayBuffer)

        // 2. Validate PDF signature & load test for corruption/password
        const verification = await verifyPdfFile(uint8Bytes, rawFile.name)
        if (!verification.valid) {
          onError(verification.error || 'error.damaged', { name: rawFile.name })
          continue
        }

        // 3. Compute SHA-256 hash
        const hash = await computeSha256(uint8Bytes)

        processed.push({
          id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `file-${Date.now()}-${Math.random()}`,
          name: rawFile.name,
          size: rawFile.size,
          pages: verification.pages || 1,
          hash,
          bytes: uint8Bytes
        })
      } catch {
        onError('error.damaged', { name: rawFile.name })
      }
    }

    if (processed.length > 0) {
      onAddFiles(processed)
    }

    // Reset input value so identical filename re-uploads work
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      await processFileList(e.dataTransfer.files)
    }
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span className="step-num">2</span>
          <span>{t('step.upload')}</span>
        </div>
        <div className="toolbar-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="application/pdf,.pdf" 
            style={{ display: 'none' }} 
            onChange={(e) => processFileList(e.target.files)}
          />
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>{t('btn.chooseFiles')}</span>
          </button>
        </div>
      </div>

      <div 
        className={`dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m16 16-4-4-4 4"></path>
          </svg>
        </div>
        <div className="dropzone-text">{t('upload.drop')}</div>
        <div className="dropzone-hint">{t('upload.hint')}</div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {files.length} file(s) · {formatBytes(totalSize)}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('col.name')}</th>
                  <th>{t('col.pages')}</th>
                  <th>{t('col.size')}</th>
                  <th>{t('col.status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('col.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const dupInfo = getFileDuplicateInfo(file.id, duplicateGroups)
                  return (
                    <tr key={file.id}>
                      <td style={{ fontWeight: 600 }}>{file.name}</td>
                      <td>{t('file.pagesCount', { count: file.pages })}</td>
                      <td>{formatBytes(file.size)}</td>
                      <td>
                        {dupInfo.isDuplicate ? (
                          <span className="badge badge-duplicate">
                            ⚠ {t('file.duplicate', { name: dupInfo.duplicateOfName || '' })}
                          </span>
                        ) : (
                          <span className="badge badge-ok">✓ Valid PDF</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button" 
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => onRemoveFile(file.id)}
                        >
                          {t('btn.remove')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
