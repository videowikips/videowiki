import controller from './controller';

const mount = function(router) {
  // ================ rendered videowiki article with meta tags for SEO
  router.get('/videowiki/*', controller.getPage);

  return router;
}

export default {
  mount,
};
