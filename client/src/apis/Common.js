import request from 'superagent'

const DELAY = 3000

export const cacheRequest = (method) =>
  !localStorage.getItem('dev-cache')
    ? method
    : (...args) => {
      // equivalent objects serialize differently and that results in different keys;
      // that's ok since the object creation sites are always the same
      const argString = JSON.stringify(args)
      const key = `${method.name}-${argString}`

      const candidate = localStorage.getItem(key)
      return candidate
        // we only cache resolves; errors may be due to a bad connection or the server
        // it's best that we retry
        ? Promise.resolve(JSON.parse(candidate))
        : method(...args).then((result) => {
          localStorage.setItem(key, JSON.stringify(result))
          return result
        })
    }

const makeSimpleCallback = (resolve, reject) =>
  (err, res) => err ? reject(err) : resolve(res)

const makeSlowCallback = (resolve, reject) =>
  (err, res) => setTimeout(() => { err ? reject(err) : resolve(res) }, DELAY)

export const makeCallback = (...args) =>
  (localStorage['dev-slow'] ? makeSlowCallback : makeSimpleCallback)(...args)

const makeSimpleMethod = (method) =>
  (url, headers = {}) =>
    new Promise((resolve, reject) => {
      method(url)
      .set(headers)
      .end(makeCallback(resolve, reject))
    })

const makePayloadMethod = (method) =>
  (url, data, headers = {}) =>
    new Promise((resolve, reject) => {
      method(url)
      .set(headers)
      .send(data)
      .end(makeCallback(resolve, reject))
    })

export const httpGet = makeSimpleMethod(request['get'])
export const httpDelete = makeSimpleMethod(request['del'])

export const httpPut = makePayloadMethod(request['put'])
export const httpPost = makePayloadMethod(request['post'])
export const httpPatch = makePayloadMethod(request['patch'])
