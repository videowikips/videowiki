import { httpGet, httpPost } from './Common'

// ============
function signup ({ email, password, firstName, lastName }) {
  const data = {
    email,
    password,
    firstName,
    lastName,
  }

  const url = '/api/auth/signup'
  return httpPost(url, data).then(
    ({ body }) => ({
      signupStatus: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

// ============
function login ({ email, password }) {
  const data = {
    email,
    password,
  }

  const url = '/api/auth/login'
  return httpPost(url, data).then(
    ({ body }) => ({
      loginStatus: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}


// ============
function validateSession () {
  const url = '/api/auth/session'

  return httpGet(url)
    .then(({ body }) => ({ session: body }))
    .catch(handleError)
}

function handleError (response) {
  if (response.status === 401) {
    return { session: null }
  } else {
    throw { response }
  }
}

export default {
  signup,
  login,
  validateSession,
}
