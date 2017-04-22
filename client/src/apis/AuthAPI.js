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
  )
}

export default {
  signup,
}
