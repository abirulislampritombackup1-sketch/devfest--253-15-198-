/**
 * Validates requirements.json structure and normalizes requirement items.
 * @param {any} rawJson 
 * @returns {{ valid: boolean, errors: string[], data: { tender: object, requirements: object[] } | null }}
 */
export function validateRequirements(rawJson) {
  const errors = []

  if (!rawJson || typeof rawJson !== 'object') {
    return { valid: false, errors: ['JSON must be an object with "tender" and "requirements"'], data: null }
  }

  // 1. Validate tender object
  const tender = rawJson.tender
  if (!tender || typeof tender !== 'object') {
    errors.push('Missing "tender" object')
  } else {
    const requiredTenderFields = ['tender_id', 'title', 'procuring_entity', 'bidder', 'submission_deadline']
    for (const field of requiredTenderFields) {
      if (!tender[field] || typeof tender[field] !== 'string' || !tender[field].trim()) {
        errors.push(`Missing or invalid tender field: "${field}"`)
      }
    }

    if (tender.submission_deadline && !/^\d{4}-\d{2}-\d{2}$/.test(tender.submission_deadline.trim())) {
      errors.push(`Invalid submission_deadline format (expected YYYY-MM-DD): "${tender.submission_deadline}"`)
    }
  }

  // 2. Validate requirements array
  const rawRequirements = rawJson.requirements
  if (!Array.isArray(rawRequirements) || rawRequirements.length === 0) {
    errors.push('"requirements" must be a non-empty array')
  }

  const seenIds = new Set()
  const normalizedRequirements = []

  if (Array.isArray(rawRequirements)) {
    rawRequirements.forEach((req, idx) => {
      if (!req || typeof req !== 'object') {
        errors.push(`Requirement at index ${idx} must be an object`)
        return
      }

      const id = String(req.id ?? '').trim()
      if (!id) {
        errors.push(`Requirement at index ${idx} is missing "id"`)
      } else if (seenIds.has(id)) {
        errors.push(`Duplicate requirement id: "${id}"`)
      } else {
        seenIds.add(id)
      }

      const orderNum = Number(req.order)
      if (isNaN(orderNum)) {
        errors.push(`Requirement "${id || idx}" has invalid "order" (must be numeric)`)
      }

      const titleEn = String(req.title_en ?? '').trim()
      if (!titleEn) {
        errors.push(`Requirement "${id || idx}" is missing "title_en"`)
      }

      normalizedRequirements.push({
        id,
        order: isNaN(orderNum) ? idx + 1 : orderNum,
        title_en: titleEn,
        title_bn: req.title_bn ? String(req.title_bn).trim() : '',
        mandatory: Boolean(req.mandatory),
        has_expiry: Boolean(req.has_expiry)
      })
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: null }
  }

  // Strictly sort requirements ascending by numeric order
  normalizedRequirements.sort((a, b) => a.order - b.order)

  return {
    valid: true,
    errors: [],
    data: {
      tender: {
        tender_id: tender.tender_id.trim(),
        title: tender.title.trim(),
        procuring_entity: tender.procuring_entity.trim(),
        bidder: tender.bidder.trim(),
        submission_deadline: tender.submission_deadline.trim()
      },
      requirements: normalizedRequirements
    }
  }
}
