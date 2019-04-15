import controller from './controller';
import isAuthenticated from '../shared/middlewares/isAuthenticated';
import { saveTemplate } from '../shared/middlewares/saveTemplate';
import { checkExportableArticle } from '../shared/middlewares/checkExportableArticle';

const mount = function(router) {
  router.get('/history', controller.getVideoHistory);
  router.post('/convert', isAuthenticated, checkExportableArticle, saveTemplate, controller.exportVideo);
  router.get('/by_article_title', controller.getVideoByArticleTitle);
  router.get('/by_article_id/:articleId', controller.getVideoByArticleId);
  router.get('/by_article_version/:version', controller.getVideoByArticleVersion);
  router.get('/:id', controller.getVideoById);

  return router;
}

export default {
  mount,
};
