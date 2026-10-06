import { validateRequirements } from './validateRequirements.js'
import { getRequirementStatus, STATUS_CODES, computeAllStatuses } from './status.js'
import { getDuplicateGroups, getFileDuplicateInfo } from './duplicates.js'

console.log('🧪 Running pure logic tests...')

// 1. Test validateRequirements
const sampleRaw = {
  tender: {
    tender_id: 'T-2026-0417',
    title: 'Supply of IT Equipment',
    procuring_entity: 'Example Directorate',
    bidder: 'Example Company Ltd.',
    submission_deadline: '2026-10-20'
  },
  requirements: [
    { id: 'R03', order: 3, title_en: 'Tax Clearance', mandatory: true, has_expiry: true },
    { id: 'R01', order: 1, title_en: 'Trade License', mandatory: true, has_expiry: true },
    { id: 'R02', order: 2, title_en: 'Bank Solvency', mandatory: false, has_expiry: false }
  ]
}

const valRes = validateRequirements(sampleRaw)
if (!valRes.valid) throw new Error('Validation failed unexpectedly: ' + valRes.errors.join(', '))
if (valRes.data.requirements[0].id !== 'R01' || valRes.data.requirements[1].id !== 'R02') {
  throw new Error('Requirements were not correctly sorted by order!')
}
console.log('  ✓ validateRequirements & order sorting: PASS')

// 2. Test status engine
const deadline = '2026-10-20'
const dummyFile = { id: 'f1', name: 'test.pdf' }

// Unmatched mandatory -> MISSING
if (getRequirementStatus({ mandatory: true, has_expiry: false }, null, '', deadline) !== STATUS_CODES.MISSING) {
  throw new Error('Expected MISSING for unmatched mandatory')
}

// Unmatched optional -> NOT_PROVIDED
if (getRequirementStatus({ mandatory: false, has_expiry: false }, null, '', deadline) !== STATUS_CODES.NOT_PROVIDED) {
  throw new Error('Expected NOT_PROVIDED for unmatched optional')
}

// Matched + has_expiry without date -> EXPIRY_NEEDED
if (getRequirementStatus({ mandatory: true, has_expiry: true }, dummyFile, '', deadline) !== STATUS_CODES.EXPIRY_NEEDED) {
  throw new Error('Expected EXPIRY_NEEDED when date is missing')
}

// Matched + has_expiry before deadline -> EXPIRED
if (getRequirementStatus({ mandatory: true, has_expiry: true }, dummyFile, '2026-10-19', deadline) !== STATUS_CODES.EXPIRED) {
  throw new Error('Expected EXPIRED for date before deadline')
}

// Matched + has_expiry ON deadline -> OK
if (getRequirementStatus({ mandatory: true, has_expiry: true }, dummyFile, '2026-10-20', deadline) !== STATUS_CODES.OK) {
  throw new Error('Expected OK for date exactly on deadline')
}

// Matched + has_expiry after deadline -> OK
if (getRequirementStatus({ mandatory: true, has_expiry: true }, dummyFile, '2026-10-25', deadline) !== STATUS_CODES.OK) {
  throw new Error('Expected OK for date after deadline')
}

// Matched + no expiry -> OK
if (getRequirementStatus({ mandatory: true, has_expiry: false }, dummyFile, '', deadline) !== STATUS_CODES.OK) {
  throw new Error('Expected OK for document without expiry')
}
console.log('  ✓ getRequirementStatus (all 5 cases + boundary dates): PASS')

// 3. Test duplicates
const mockFiles = [
  { id: '1', hash: 'abc', name: 'license.pdf' },
  { id: '2', hash: 'abc', name: 'license_copy.pdf' },
  { id: '3', hash: 'xyz', name: 'bank.pdf' }
]
const dupGroups = getDuplicateGroups(mockFiles)
if (dupGroups.size !== 1) throw new Error('Expected 1 duplicate group')
const info = getFileDuplicateInfo('1', dupGroups)
if (!info.isDuplicate || info.duplicateOfName !== 'license_copy.pdf') {
  throw new Error('Duplicate info mismatch')
}
console.log('  ✓ duplicate grouping & matching: PASS')

console.log('🎉 All core logic unit tests passed successfully!')
