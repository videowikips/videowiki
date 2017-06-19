import { httpGet } from './Common'

function fetchLeaderboard () {
  const url = `/api/users/leaderboard`

  return httpGet(url).then(
    ({ body }) => ({
      leaderboard: body.users,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

export default {
  fetchLeaderboard,
}
