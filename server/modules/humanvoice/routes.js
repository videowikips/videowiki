import controller from './controller';
import isAuthenticated from '../shared/middlewares/isAuthenticated';

export const mount = function(router) {
  router.get('/', isAuthenticated, controller.getHumanVoice);

  router.post('/audios', isAuthenticated, controller.addAudio);

  router.delete('/audios', isAuthenticated, controller.deleteAudio)

  router.post('/translated_text', isAuthenticated, controller.addTranslatedText)

  return router;
}

export default {
  mount,
};
