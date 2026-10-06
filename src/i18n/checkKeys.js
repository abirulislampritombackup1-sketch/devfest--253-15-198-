import en from './en.js'
import bn from './bn.js'

const enKeys = Object.keys(en).sort()
const bnKeys = Object.keys(bn).sort()

const missingInBn = enKeys.filter(k => !(k in bn))
const missingInEn = bnKeys.filter(k => !(k in en))

let hasError = false

if (missingInBn.length > 0) {
  console.error('❌ Keys in en.js but missing in bn.js:')
  missingInBn.forEach(k => console.error(`  - ${k}`))
  hasError = true
}

if (missingInEn.length > 0) {
  console.error('❌ Keys in bn.js but missing in en.js:')
  missingInEn.forEach(k => console.error(`  - ${k}`))
  hasError = true
}

if (hasError) {
  console.error('\n⚠️ i18n key mismatch detected! Fix missing keys.')
  process.exit(1)
} else {
  console.log(`✅ All ${enKeys.length} i18n keys are perfectly synchronized between EN and BN!`)
  process.exit(0)
}
