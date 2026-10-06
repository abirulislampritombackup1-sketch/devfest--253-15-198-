/**
 * Computes SHA-256 hexadecimal hash string for a Uint8Array buffer.
 * @param {Uint8Array} bytes 
 * @returns {Promise<string>}
 */
export async function computeSha256(bytes) {
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback hash implementation if SubtleCrypto is unavailable
  let hash = 0
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i]
    hash |= 0
  }
  return `hash-${Math.abs(hash).toString(16)}-${bytes.length}`
}

/**
 * Builds a Map of hash -> Array of files with that hash.
 * Only groups with length > 1 are considered duplicates.
 * @param {Array<{ id: string, hash: string, name: string }>} files 
 * @returns {Map<string, Array<{ id: string, name: string }>>}
 */
export function getDuplicateGroups(files = []) {
  const map = new Map()
  for (const f of files) {
    if (!f.hash) continue
    if (!map.has(f.hash)) {
      map.set(f.hash, [])
    }
    map.get(f.hash).push(f)
  }

  const duplicates = new Map()
  for (const [hash, group] of map.entries()) {
    if (group.length > 1) {
      duplicates.set(hash, group)
    }
  }
  return duplicates
}

/**
 * Checks if a specific file is part of a duplicate group.
 * If yes, returns the name of the first counterpart duplicate.
 * @param {string} fileId 
 * @param {Map<string, Array<{ id: string, name: string }>>} duplicateGroups 
 * @returns {{ isDuplicate: boolean, duplicateOfName: string | null }}
 */
export function getFileDuplicateInfo(fileId, duplicateGroups) {
  for (const [, group] of duplicateGroups.entries()) {
    const match = group.find(f => f.id === fileId)
    if (match) {
      const other = group.find(f => f.id !== fileId)
      return {
        isDuplicate: true,
        duplicateOfName: other ? other.name : null
      }
    }
  }
  return { isDuplicate: false, duplicateOfName: null }
}
