import { capsToCamel, camelToCaps } from '../utils/StringUtils'
import { objectMatches } from '../utils/ObjectUtils'

/**
 * Creates an action factory of a given type with given properties
 * @param {string} type The action type in CAPS_CASE
 * @param {Array<string>} [argNames] The name of the properties associated with this action
 * @returns {Function} The function to be invoked when calling `dispatch`
 *
 * @example
 * makeActionCreator('TYPE_A', ['a', 'b'])(123, 321)
 * // { type: 'TYPE_A', a: 123, b: 321 }
 *
 * makeActionCreator('TYPE_A', ['a', 'b'])({ a: 123, b: 321 })
 * // { type: 'TYPE_A', a: 123, b: 321 }
 */
function makeActionCreator (type, argNames) {
  if (argNames && argNames.includes('type')) {
    console.warn('Action property "type" is reserved')
  }

  const objectMatchesAction = objectMatches(argNames)

  return (...args) => {
    const action = { type }

    if (argNames) {
      if (args.length === 1 && objectMatchesAction(args[0])) {
        Object.assign(action, args[0])
      } else {
        argNames.forEach((argName, index) => {
          action[argName] = args[index]
        })
      }
    }

    Object.freeze(action)

    return action
  }
}

function registerHandle (exports, handle) {
  exports[handle] = handle
}

/**
 * Exposes the action type and action creator on the provided exports object
 * @param {Object} exports The exports object
 * @param {string} typeCaps The action type in CAPS_CASE
 * @param {Array<string>} [argNames] The name of the properties associated with this action
 */
export function registerAction (exports, typeCaps, argNames) {
  const typeCamel = capsToCamel(typeCaps)

  // export action creator
  exports[typeCamel] = makeActionCreator(typeCaps, argNames)

  // export action type; used by the reducers
  registerHandle(exports, typeCaps)
}

/**
 * Creates an async action factory
 * @param {Object} apiProvider The network api provider
 * @param {string} methodName The network method
 * @param {{ requestAction, receiveAction, failedAction }} actions The 3 action creators that make up an async action
 * @returns {Function}
 *
 * @example
 * makeAsyncActionCreator(BudgetApi, 'getBudget')
 */
function makeAsyncActionCreator (
  apiProvider,
  methodName,
  { requestAction, receiveAction, failedAction },
) {
  const apiMethod = apiProvider[methodName]

  if (!apiMethod) {
    console.warn('Method', methodName, 'is not part of the api', apiProvider)
  }

  if (apiMethod && apiMethod.length > 1) {
    console.warn('Method', methodName, 'should take no more than a single argument')
  }

  return (data, resolve, reject) =>
    (dispatch) => {
      dispatch(requestAction(data))

      apiMethod(data).then(
        (response) => {
          dispatch(receiveAction(response)) // compose(dispatch, receiveAction)
          resolve && resolve(response)
        },
        (reason) => {
          dispatch(failedAction(reason))
          reject && reject(reason)
        },
      )
    }
}

/**
 * Exposes the handle for an asynchronous action step on the provided exports object
 * @param {Object} exports The exports object
 * @param {string} typeCaps The action type in CAPS_CASE
 * @returns {Function}
 */
function registerAsyncStep (exports, typeCaps) {
  registerHandle(exports, typeCaps)

  return function (properties) {
    const action = { type: typeCaps }

    if (properties && properties.hasOwnProperty('type')) {
      console.warn('Tried to override the "type" property of an', typeCaps, 'action')
    }

    Object.assign(action, properties)
    Object.freeze(action)

    return action
  }
}

/**
 * Exposes the async action creator on the provided exports object
 * @param {Object} exports The exports object
 * @param {Object} apiProvider
 * @param {string} methodName
 */
export function registerAsyncAction (exports, apiProvider, methodName) {
  const typeCaps = camelToCaps(methodName)

  registerHandle(exports, typeCaps)

  const requestAction = registerAsyncStep(exports, `${typeCaps}_REQUEST`)
  const receiveAction = registerAsyncStep(exports, `${typeCaps}_RECEIVE`)
  const failedAction = registerAsyncStep(exports, `${typeCaps}_FAILED`)

  exports[methodName] = makeAsyncActionCreator(
    apiProvider,
    methodName,
    { requestAction, receiveAction, failedAction },
  )
}
