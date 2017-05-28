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
function login ({ email, password, remember }) {
  const data = {
    email,
    password,
    remember,
  }

  const url = '/api/auth/login'
  return httpPost(url, data).then(
    ({ body }) => ({
      session: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

// ============
function logout () {
  const url = '/api/auth/logout'
  return httpGet(url)
    .then(({ body }) => ({ logoutStatus: body }))
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
  logout,
  validateSession,
}
