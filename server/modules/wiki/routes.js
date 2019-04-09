import controller from './controller';
import isAuthenticated from '../shared/middlewares/isAuthenticated';
import { saveTemplate } from '../shared/middlewares/saveTemplate';
import { uploadFileToWikiCommons } from '../shared/middlewares/wikiUpload';
import uploadLocal from '../shared/middlewares/uploadLocal';

const mount = function(router) {
  // ========== Search
  router.get('/search', controller.searchWikiArticles);

  // ============== upload image url to slide
  router.post('/article/imageUpload', controller.uploadImageURLToSlide);

  // ============== Upload media to slide
  // uploadFileToWikiCommons  ==========> PRODUCTION
  router.post('/article/uploadCommons', isAuthenticated, saveTemplate, uploadFileToWikiCommons, controller.uploadImageToCommonsSlide);

   // ============== Upload media to locally temporarly slide
  router.post('/article/uploadTemp', isAuthenticated, uploadLocal, controller.uploadTempFile);

  // ============== Fetch VideoWiki article by title
  router.get('/article', controller.getArticleByTitle);

  // ============== Fetch article summary by title
  router.get('/article/summary', controller.getArticleSummaryByTitle);

  // ============== Convert wiki to video wiki
  router.get('/convert', controller.convertWikiToVideowiki);

  router.get('/updateArticle', controller.updateVideowikiArticle);
  // ================ Get infobox
  router.get('/infobox', controller.getArticleInfobox);

  // ============== Get commons video url by it's name
  router.post('/commons/video_by_name', controller.getVideoByName);

  // ============== Get wiki content
  router.get('/', controller.getWikiContent);

  router.get('/forms', isAuthenticated, controller.getUserUploadForms);
  return router;
}

export default {
  mount,
};

const config = require('../shared/config');
