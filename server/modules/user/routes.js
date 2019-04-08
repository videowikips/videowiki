import controller from './controller';

const mount = function(router) {
  router.get('/leaderboard', controller.getLeaderboard);

  return router;
}

export default {
  mount,
};
