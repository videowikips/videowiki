/**
 * Converts a string from CAPS_CASE to camelCase
 * @param {string} string
 * @returns {string}
 */
export function capsToCamel (string) {
  const camelCaps = string.replace(/_?([A-Z]+)/g, (match, group) =>
    `${group[0].toUpperCase()}${group.slice(1).toLowerCase()}`,
  )

  return `${camelCaps[0].toLowerCase()}${camelCaps.slice(1)}`
}

/**
 * Converts a string from camelCase to CAPS_CASE
 * @param {string} string
 * @returns {string}
 */
export function camelToCaps (string) {
  const underscoreCamel = string.replace(/([a-z])([A-Z])/g, (match, end, begin) =>
    `${end}_${begin}`,
  )

  return underscoreCamel.toUpperCase()
}

/**
 * Converts a string from snake_case to camelCase
 * @param {string} string
 * @returns {string}
 */
export function snakeToCamel (string) {
  return string.replace(
    /_([a-z])/g,
    (match, group) => group.toUpperCase(),
  )
}

/**
 * Converts a string from camelCase to snake_case
 * @param {string} string
 * @returns {string}
 */
export function camelToSnake (string) {
  return string.replace(
    /([a-z])([A-Z])/g,
    (match, end, begin) => `${end}_${begin.toLowerCase()}`,
  )
}

/**
 * Creates a safe URL by encoding the values with encodeURIComponent
 * @param strings
 * @param values
 * @returns {string}
 */
export function url (strings, ...values) {
  const init = values.reduce(
    (result, value, index) => `${result}${strings[index].trim()}${encodeURIComponent(value)}`,
    '',
  )

  return `${init}${strings[strings.length - 1].trim()}`
}

/**
 * Create query string out of an key-value object.
 * @param object
 * @returns {string}
 */
export function queryString (kvPairs) {
  return Object.keys(kvPairs)
    .map((key) => {
      const value = kvPairs[key]
      return value === undefined || value === null
        ? undefined
        : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .filter((value) => value !== undefined)
    .join('&')
}
