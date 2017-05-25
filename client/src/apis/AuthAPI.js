import { httpPost } from './Common'

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

export default {
  signup,
  login,
}
