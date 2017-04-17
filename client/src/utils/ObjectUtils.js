/**
 * Checks that an object has all the provided properties
 * @param {Array<string>} propertyNames Properties to check for
 * @returns {boolean}
 *
 * @example
 * objectMatches(['a', 'b'])({ a: 1, b: 2 })
 * // true
 *
 * objectMatches(['a', 'b'])({ a: 1 })
 * // false
 *
 * objectMatches(['a', 'b'])({ a: 1, b: 2, c: 3 })
 * // false
 */
export function objectMatches (propertyNames) {
  const propertyNamesSet = new Set(propertyNames)

  return (object) => {
    if (!object || typeof object !== 'object') { return false }

    const keys = Object.keys(object)
    return keys.length === propertyNamesSet.size &&
      keys.every((key) => propertyNamesSet.has(key))
  }
}

/**
 * Deeply merges an object on top of another with the minimum amount of cloning
 * @param source
 * @param addition
 *
 * @example
 * const source = { a: { b: 1, c: 2 }, z: {...} };
 * const addition = { a: { b: 3 }, e: 5 };
 * mergeImmutable(source, addition)
 * // { a: { b: 3, c: 2 }, e: 5, z: {...} }
 * // z is not mentioned in the addition and thus it has not been deep cloned
 */
export function mergeImmutable (source, addition) {
  // filtering out unmeargeable data
  if (
    typeof source !== 'object' ||
    source === null ||
    Array.isArray(source) || // merging arrays makes no sense
    typeof addition !== 'object' ||
    addition === null ||
    Array.isArray(addition)
  ) {
    return addition
  }

  const clone = Object.assign({}, source)

  Object.keys(addition).forEach((key) => {
    clone[key] = mergeImmutable(clone[key], addition[key])
  })

  return clone
}

/**
 * Updates the value of source.{chain} by applying a function to the old value.
 * The original source is not deep cloned, but is preserved.
 * @param {Object} source
 * @param {Array<string>} chain
 * @param {Function} fun
 *
 * @example
 * const source = { a: { b: 11, c: 22 }, z: {...} };
 * applyImmutable(source, ['a', 'b'], (value) => value ** 2)
 * // { a: { b: 121, c: 22 }, z: {...} }
 * // z is not part of the chain and thus it has not been deep cloned
 *
 * applyImmutable(source, ['d', 'e'], (value = 0) => value + 1)
 * // { a: {...}, d: { e: 1 }, z: {...} }
 * // if the chain is longer than the depth of source then new nodes/objects are created
 */
export function applyImmutable (source, chain, fun) {
  function createObject (index) {
    return index < chain.length
      ? { [chain[index]]: createObject(index + 1) }
      : fun()
  }

  function recurse (source, index) {
    if (index >= chain.length) {
      return fun(source)
    }

    if (typeof source !== 'object' || source === null) {
      return createObject(index)
    }

    const shallow = Array.isArray(source)
      ? source.slice()
      : Object.assign({}, source)

    const propertyName = chain[index]
    shallow[propertyName] = recurse(source[propertyName], index + 1)
    return shallow
  }

  if (!Array.isArray(chain)) {
    chain = [chain]
  }

  return recurse(source, 0)
}

/**
 * Apply applyImmutable multiple times, to a sequence of parameters
 * @param {Object} source
 * @param {...Array} pairs Pairs of arguments to pass to applyImmutable
 *
 * @example
 * applyImmutableMore(
 *   { a: 11, b: 22 },
 *   ['a', (value) => value ** 2],
 *   ['b', (value) => value + 1],
 * )
 * // { a: 121, b: 23 }
 */
export function applyImmutableMore (source, ...pairs) {
  return pairs.reduce(
    (partial, [chain, fun]) => applyImmutable(partial, chain, fun),
    source,
  )
}

/**
 * Updates the value of source.{chain} to a given value without deep cloning the
 * original source. The update is done in a non-destructive manner - the original source
 * is preserved.
 * @param {Object} source
 * @param {Array<string>} chain
 * @param {*} value
 *
 * @example
 * const source = { a: { b: 1, c: 2 }, z: {...} };
 * setImmutable(source, ['a', 'b'], 3)
 * // { a: { b: 3, c: 2 }, z: {...} }
 * // z is not part of the chain and thus it has not been deep cloned
 *
 * setImmutable(source, ['a', 'b', 'd', 'e'], 3)
 * // { a: { b: { d: { e: 3 } }, c: 2 }, z: {...} }
 * // if the chain is longer than the depth of source then new nodes/objects are created
 */
export function setImmutable (source, chain, value) {
  return applyImmutable(source, chain, () => value)
}

/**
 * Apply setImmutable multiple times, to a sequence of parameters
 * @param {Object} source
 * @param {...Array} pairs Pairs of arguments to pass to setImmutable
 *
 * @example
 * setImmutableMore(
 *   { a: 11, b: 22 },
 *   ['a', 123],
 *   ['b', 321],
 * )
 * // { a: 123, b: 321 }
 */
export function setImmutableMore (source, ...pairs) {
  return pairs.reduce(
    (partial, [chain, value]) => setImmutable(partial, chain, value),
    source,
  )
}

/**
 * Deletes the last member of source.{chain} without deep cloning the original source.
 * The update is done in a non-destructive manner - the original source is preserved.
 * @param {Object} source
 * @param {Array<string>} chain
 *
 * @example
 * const source = { a: { b: 1, c: 2 }, z: {...} };
 * deleteImmutable(source, ['a', 'b'])
 * // { a: { c: 2 }, z: {...} }
 * // z is not part of the chain and thus it has not been deep cloned
 *
 * setImmutable(source, ['a', 'b', 'd', 'e'])
 * // { a: { c: 2 }, z: {...} }
 * // the chain can be longer than the depth of the source
 */
export function deleteImmutable (source, chain) {
  function recurse (source, index) {
    if (typeof source !== 'object' || source === null) {
      return source
    }

    const shallow = Array.isArray(source)
      ? source.slice()
      : Object.assign({}, source)

    const propertyName = chain[index]

    if (shallow.hasOwnProperty(propertyName)) {
      if (index < chain.length - 1) {
        shallow[propertyName] = recurse(source[propertyName], index + 1)
      } else {
        Reflect.deleteProperty(shallow, chain[index])
      }
    }

    return shallow
  }

  if (!Array.isArray(chain)) {
    chain = [chain]
  }

  return recurse(source, 0)
}

/**
 * Apply deleteImmutable multiple times, to a sequence of parameters
 * @param {Object} source
 * @param {...(Array<string>|string)} chains Arguments to pass to deleteImmutable
 *
 * @example
 * deleteImmutableMore(
 *   { a: 11, b: 22 },
 *   'a',
 *   'b',
 * )
 * // {}
 */
export function deleteImmutableMore (source, ...chains) {
  return chains.reduce(
    (partial, chain) => deleteImmutable(partial, chain),
    source,
  )
}

export function shallowEqualArray (arrayA, arrayB) {
  if (arrayA === arrayB) {
    return true
  }

  if (
    !Array.isArray(arrayA) ||
    !Array.isArray(arrayB) ||
    arrayA.length !== arrayB.length
  ) {
    return false
  }

  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) {
      return false
    }
  }

  return true
}

// https://github.com/gaearon/react-pure-render/blob/master/src/shallowEqual.js
/**
 * Shallowly tests if two objects are equal.
 * Similar to _.isEqual but shallow and for objects only.
 * Minor quirk: properties are compared with `===` and thus NaN properties
 * are not equal to themselves and nor is +0 with -0.
 * @param {*} objA
 * @param {*} objB
 * @returns {boolean}
 */
export function shallowEqual (objA, objB) {
  if (objA === objB) {
    return true
  }

  if (
    typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  //! AT: why is having the property more important than it being on the
  // prototype chain? Is props some funky object with tons of properties
  // on the prototype chain?

  // Test for A's keys different from B.
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)
  for (let i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

/**
 * Compares that two objects have the same keys from a given subset.
 * Minor quirk: properties are compared with `===` and thus NaN properties
 * are not equal to themselves and nor is +0 with -0.
 * @param {Object} objA
 * @param {Object} objB
 * @param {Array<string>} keys
 * @returns {boolean}
 */
export function shallowEqualOnly (objA, objB, keys) {
  if (objA === objB) {
    return true
  }

  if (
    typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null
  ) {
    return false
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    if (objA[key] !== objB[key]) {
      return false
    }
  }

  return true
}
