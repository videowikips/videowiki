import controller from './controller';
import validateRequest from './validate_request';
import isAuthenticated from '../shared/middlewares/isAuthenticated';

export const mount = function(router) {
  router.get('/', isAuthenticated, validateRequest.validate_article_exists('GET'), controller.getHumanVoice);

  router.post('/audios', isAuthenticated, validateRequest.validate_article_exists('POST'), controller.addAudio);

  router.delete('/audios', isAuthenticated, validateRequest.validate_article_exists('DELETE'), controller.deleteAudio)

  router.post('/translated_text', isAuthenticated, validateRequest.validate_article_exists('POST'), controller.addTranslatedText)

  return router;
}

export default {
  mount,
};
