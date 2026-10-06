/**
 * Normalizes string into alphanumeric tokens.
 * @param {string} str 
 * @returns {string[]}
 */
function tokenize(str = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
}

/**
 * Attempts to automatically suggest matches between requirements and uploaded files.
 * @param {object[]} requirements
 * @param {object[]} files
 * @param {Map<string, Array<object>>} duplicateGroups
 * @returns {Record<string, string>} suggested matches: reqId -> fileId
 */
export function autoMatchFiles(requirements = [], files = [], duplicateGroups = new Map()) {
  const suggestions = {}
  const usedFileIds = new Set()

  // Track matched hashes to avoid matching duplicates
  const matchedHashes = new Set()

  for (const req of requirements) {
    const reqTokens = new Set([
      ...tokenize(req.id),
      ...tokenize(req.title_en)
    ])

    let bestScore = 0
    let bestFile = null

    for (const file of files) {
      if (usedFileIds.has(file.id)) continue
      if (matchedHashes.has(file.hash)) continue

      const fileTokens = tokenize(file.name)
      const rawLowerName = file.name.toLowerCase()
      const reqIdLower = req.id.toLowerCase()

      let score = 0

      // Exact ID match in filename (e.g., "R01" in "R01_Trade_License.pdf")
      if (rawLowerName.includes(reqIdLower)) {
        score += 10
      }

      // Keyword token overlap
      for (const token of fileTokens) {
        if (reqTokens.has(token)) {
          score += 3
        }
      }

      if (score > bestScore && score >= 3) {
        bestScore = score
        bestFile = file
      }
    }

    if (bestFile) {
      suggestions[req.id] = bestFile.id
      usedFileIds.add(bestFile.id)
      if (bestFile.hash) {
        matchedHashes.add(bestFile.hash)
      }
    }
  }

  return suggestions
}
