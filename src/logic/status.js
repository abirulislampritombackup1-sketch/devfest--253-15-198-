/**
 * Deterministic status codes
 */
export const STATUS_CODES = {
  MISSING: 'MISSING',
  EXPIRY_NEEDED: 'EXPIRY_NEEDED',
  EXPIRED: 'EXPIRED',
  NOT_PROVIDED: 'NOT_PROVIDED',
  OK: 'OK'
}

export const BLOCKING_STATUSES = new Set([
  STATUS_CODES.MISSING,
  STATUS_CODES.EXPIRY_NEEDED,
  STATUS_CODES.EXPIRED
])

/**
 * Computes status for a single requirement.
 * @param {object} req - Requirement object { id, mandatory, has_expiry }
 * @param {object|null} file - Matched file object
 * @param {string|undefined} expiryDate - String "YYYY-MM-DD"
 * @param {string} submissionDeadline - String "YYYY-MM-DD"
 * @returns {'MISSING' | 'EXPIRY_NEEDED' | 'EXPIRED' | 'NOT_PROVIDED' | 'OK'}
 */
export function getRequirementStatus(req, file, expiryDate, submissionDeadline) {
  // 1. If no file matched
  if (!file) {
    return req.mandatory ? STATUS_CODES.MISSING : STATUS_CODES.NOT_PROVIDED
  }

  // 2. File is matched and document requires expiry
  if (req.has_expiry) {
    const trimmedDate = String(expiryDate || '').trim()
    if (!trimmedDate || !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      return STATUS_CODES.EXPIRY_NEEDED
    }

    // Lexicographical string comparison (strictly YYYY-MM-DD, avoids timezone offsets)
    const deadline = String(submissionDeadline || '').trim()
    if (deadline && trimmedDate < deadline) {
      return STATUS_CODES.EXPIRED
    }

    return STATUS_CODES.OK
  }

  // 3. File is matched and does not require expiry
  return STATUS_CODES.OK
}

/**
 * Computes statuses for all requirements and extracts blocking problems.
 * @param {object[]} requirements
 * @param {Record<string, string>} matches - reqId -> fileId
 * @param {Record<string, string>} expiry - reqId -> date
 * @param {Map<string, object>} filesMap - fileId -> file
 * @param {string} submissionDeadline
 * @returns {{ statuses: Record<string, string>, blockingProblems: Array<{ reqId: string, status: string, titleEn: string, titleBn: string }> }}
 */
export function computeAllStatuses(requirements = [], matches = {}, expiry = {}, filesMap = new Map(), submissionDeadline = '') {
  const statuses = {}
  const blockingProblems = []

  for (const req of requirements) {
    const fileId = matches[req.id]
    const file = fileId ? filesMap.get(fileId) : null
    const dateVal = expiry[req.id]

    const status = getRequirementStatus(req, file, dateVal, submissionDeadline)
    statuses[req.id] = status

    if (BLOCKING_STATUSES.has(status)) {
      blockingProblems.push({
        reqId: req.id,
        status,
        titleEn: req.title_en,
        titleBn: req.title_bn || req.title_en
      })
    }
  }

  return { statuses, blockingProblems }
}
