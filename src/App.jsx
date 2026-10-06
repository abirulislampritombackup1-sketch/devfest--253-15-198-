import React, { useState, useMemo } from 'react'
import Header from './components/Header.jsx'
import NoticeList from './components/NoticeList.jsx'
import TenderDetailsCard from './components/TenderDetailsCard.jsx'
import FileUploadZone from './components/FileUploadZone.jsx'
import MatchTable from './components/MatchTable.jsx'
import BonusToolbar from './components/BonusToolbar.jsx'
import SummaryStickyBar from './components/SummaryStickyBar.jsx'
import PackageModal from './components/PackageModal.jsx'

import { useLang } from './i18n/index.jsx'
import { getDuplicateGroups } from './logic/duplicates.js'
import { computeAllStatuses } from './logic/status.js'
import { buildTenderPackagePdf } from './logic/buildPackage.js'
import { autoMatchFiles } from './logic/autoMatch.js'
import { exportChecklistCsv } from './logic/exportCsv.js'
import { PDFDocument } from 'pdf-lib'

export default function App() {
  const { lang, t } = useLang()

  // State
  const [tender, setTender] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [files, setFiles] = useState([])
  const [matches, setMatches] = useState({})
  const [expiry, setExpiry] = useState({})
  const [notices, setNotices] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPackage, setGeneratedPackage] = useState(null)

  // Derived: Files lookup Map
  const filesMap = useMemo(() => {
    const map = new Map()
    files.forEach(f => map.set(f.id, f))
    return map
  }, [files])

  // Derived: Duplicate Groups
  const duplicateGroups = useMemo(() => {
    return getDuplicateGroups(files)
  }, [files])

  // Derived: Deterministic Statuses & Blocking Problems
  const { statuses, blockingProblems } = useMemo(() => {
    return computeAllStatuses(
      requirements,
      matches,
      expiry,
      filesMap,
      tender?.submission_deadline
    )
  }, [requirements, matches, expiry, filesMap, tender])

  const canGenerate = useMemo(() => {
    return Boolean(tender) && requirements.length > 0 && blockingProblems.length === 0
  }, [tender, requirements, blockingProblems])

  const matchedCount = useMemo(() => {
    return Object.values(matches).filter(Boolean).length
  }, [matches])

  // Notice helper
  const addNotice = (type, code, params = {}) => {
    const id = `notice-${Date.now()}-${Math.random()}`
    setNotices(prev => [{ id, type, code, params }, ...prev.slice(0, 4)])
  }

  const handleDismissNotice = (id) => {
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  // M1: Load Requirements
  const handleLoadRequirements = (newTender, newReqs) => {
    setTender(newTender)
    setRequirements(newReqs)
    setMatches({})
    setExpiry({})
    setGeneratedPackage(null)
  }

  // M2: Add Files
  const handleAddFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  // M2: Remove File
  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))

    // Clear match referencing this file
    setMatches(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(reqId => {
        if (updated[reqId] === fileId) {
          delete updated[reqId]
        }
      })
      return updated
    })

    // Clear expiry for requirements that were matched to this file
    setExpiry(prev => {
      const updated = { ...prev }
      Object.keys(matches).forEach(reqId => {
        if (matches[reqId] === fileId) {
          delete updated[reqId]
        }
      })
      return updated
    })
  }

  // M3: Match selection
  const handleMatchChange = (reqId, fileId) => {
    setMatches(prev => {
      const updated = { ...prev }
      if (!fileId) {
        delete updated[reqId]
      } else {
        // Enforce 1:1 - if file is assigned elsewhere, remove from there
        Object.keys(updated).forEach(k => {
          if (updated[k] === fileId) delete updated[k]
        })
        updated[reqId] = fileId
      }
      return updated
    })

    // If file is unassigned or changed, reset expiry date for that requirement
    if (!fileId) {
      setExpiry(prev => {
        const next = { ...prev }
        delete next[reqId]
        return next
      })
    }
  }

  // M4: Expiry entry
  const handleExpiryChange = (reqId, dateStr) => {
    setExpiry(prev => {
      if (!dateStr) {
        const next = { ...prev }
        delete next[reqId]
        return next
      }
      return { ...prev, [reqId]: dateStr }
    })
  }

  // Bonus 2: Auto Match
  const handleAutoMatch = () => {
    const suggestions = autoMatchFiles(requirements, files, duplicateGroups)
    const count = Object.keys(suggestions).length
    if (count > 0) {
      setMatches(prev => ({ ...prev, ...suggestions }))
      addNotice('info', 'autoMatch.done', { count })
    }
  }

  // Bonus 3: Export CSV
  const handleExportCsv = () => {
    exportChecklistCsv({
      tender,
      requirements,
      matches,
      expiry,
      statuses,
      filesMap,
      lang,
      t
    })
  }

  // Clear all matches
  const handleClearMatches = () => {
    setMatches({})
    setExpiry({})
  }

  // M7: Generate Package PDF
  const handleGeneratePackage = async () => {
    if (!canGenerate || isGenerating) return

    setIsGenerating(true)
    try {
      const pdfBytes = await buildTenderPackagePdf({
        tender,
        requirements,
        matches,
        filesMap
      })

      // Extract exact page count from generated package
      const genDoc = await PDFDocument.load(pdfBytes)
      const pages = genDoc.getPageCount()

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      const fileName = `${tender.tender_id}_Package.pdf`

      setGeneratedPackage({
        blobUrl,
        fileName,
        pages
      })
    } catch (err) {
      console.error('Package generation error:', err)
      addNotice('error', 'error.generate')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="app-container">
      <Header />

      <NoticeList 
        notices={notices} 
        onDismiss={handleDismissNotice} 
      />

      {/* Step 1: Tender Details */}
      <TenderDetailsCard 
        tender={tender}
        requirementsCount={requirements.length}
        hasExistingWork={Object.keys(matches).length > 0}
        onLoadRequirements={handleLoadRequirements}
        onError={(code, params) => addNotice('error', code, params)}
      />

      {/* Step 2: Upload Files */}
      <FileUploadZone 
        files={files}
        duplicateGroups={duplicateGroups}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        onError={(code, params) => addNotice('error', code, params)}
      />

      {/* Step 3: Match & Check */}
      {requirements.length > 0 && (
        <>
          <BonusToolbar 
            hasRequirements={requirements.length > 0}
            hasFiles={files.length > 0}
            onAutoMatch={handleAutoMatch}
            onExportCsv={handleExportCsv}
            onClearMatches={handleClearMatches}
          />

          <MatchTable 
            requirements={requirements}
            files={files}
            matches={matches}
            expiry={expiry}
            statuses={statuses}
            duplicateGroups={duplicateGroups}
            onMatchChange={handleMatchChange}
            onExpiryChange={handleExpiryChange}
          />
        </>
      )}

      {/* Sticky Bottom Bar */}
      <SummaryStickyBar 
        canGenerate={canGenerate}
        blockingProblems={blockingProblems}
        totalRequirements={requirements.length}
        matchedCount={matchedCount}
        isGenerating={isGenerating}
        onGenerate={handleGeneratePackage}
      />

      {/* Package Generated Modal */}
      {generatedPackage && (
        <PackageModal 
          generatedPackage={generatedPackage}
          onClose={() => setGeneratedPackage(null)}
        />
      )}
    </div>
  )
}
