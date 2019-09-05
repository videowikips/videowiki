import controller from './controller';
import { checkEditableArticle } from '../shared/middlewares/checkEditableArticle';

const mount = function(router) {
  router.get('/top', controller.getTopArticles);
  router.get('/all', controller.getAllArticles);
  router.get('/count', controller.countPublishedArticles);
  router.get('/progress', controller.getConvertProgress);
  router.get('/publish', checkEditableArticle, controller.publishDraftedArticle);
  router.get('/contributors', controller.getArticleContributors);
  router.get('/audios', controller.getAudioFileInfo);
  router.post('/audios', controller.uploadSlideAudio)
  router.post('/media/durations', controller.updateMediaDurations)

  // =========== bing image search
  router.get('/bing/images', controller.searchBingImages);
  // =========== gif search
  router.get('/gifs', controller.searchBingGifs)

  return router;
}

export default {
  mount,
};
