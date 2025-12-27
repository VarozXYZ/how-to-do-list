/**
 * Normalizes a card ID to a number, handling both string and number inputs
 * @param {string|number} id - The card ID to normalize
 * @returns {number} The normalized card ID as a number
 */
export const normalizeCardId = (id) => {
  return typeof id === 'string' ? parseInt(id, 10) : id
}

/**
 * Compares two card IDs, handling both string and number types
 * @param {string|number} id1 - First card ID
 * @param {string|number} id2 - Second card ID
 * @returns {boolean} True if IDs are equal
 */
export const compareCardIds = (id1, id2) => {
  return normalizeCardId(id1) === normalizeCardId(id2)
}

