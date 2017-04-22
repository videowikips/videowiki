import _ from 'lodash'

export function switchOnStateArray (propertyName, componentStates) {
  return function () {
    const state = this.props[propertyName]
    if (!_.includes(componentStates, state)) {
      console.error(`The state of '${this.constructor.displayName}' is '${state}'. However, [${componentStates}] were the only values found in its render function. Check it out and include '${state}' in the array of switch-on-state`)
    } else {
      const stateName = `${state[0].toUpperCase()}${state.slice(1)}`
      const funcName = `_render${stateName}`
      return Reflect.apply(this[funcName], this, [])
    }
  }
}

/**
 * Dispatches to different render functions based on the state of the component
 * stored in the local prop given by statePropertyName. Typical states of components
 * are 'loading', 'editing', 'loaded', 'readonly'.
 *
 * @param {string} statePropertyName
 * @param {Object<string, (string|Function)>} cases
 * @returns {ReactElement}
 */
export function switchOnState (statePropertyName, cases) {
  return function () {
    const state = this.props[statePropertyName]
    const match = cases[state]

    if (typeof match === 'function') {
      return Reflect.apply(match, this, [])
    } else if (typeof match === 'string') {
      return Reflect.apply(this[match], this, [])
    } else {
      console.error(`The switch-on-state handler for '${statePropertyName}' is neither a function or a string`)
    }
  }
}

/**
 * Copies the given properties from one object to a new one and returns it.
 * Useful when passing more properties to components at a time.
 *
 * @param {Object} object
 * @param {Array<string>} propertyNames
 * @returns {Object}
 *
 * @example
 * // passing only properties 'a', 'b', 'c', 'd' from a parent component to a child
 * <Child {...extendOnly(this.props, ['a', 'b', 'c', 'd'])} />
 *
 * // is the same as
 * <Child a={this.props.a} b={this.props.b} c={this.props.c} d={this.props.d} />
 */
export function extendOnly (object, propertyNames) {
  return propertyNames.reduce((partialClone, propertyName) => {
    partialClone[propertyName] = object[propertyName]
    return partialClone
  }, {})
}
