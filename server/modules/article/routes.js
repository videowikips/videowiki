import controller from './controller';

const mount = function(router) {
  router.get('/top', controller.getTopArticles);
  router.get('/all', controller.getAllArticles);
  router.get('/count', controller.countPublishedArticles);
  router.get('/progress', controller.getConvertProgress);
  router.get('/publish', controller.publishDraftedArticle);
  router.get('/contributors', controller.getArticleContributors);
  router.get('/audios', controller.getAudioFileInfo);

  router.get('/wikimediaCommons/images', controller.searchWikiCommonsImages);

  router.get('/wikimediaCommons/gifs', controller.searchWikiCommonsGifs);

  // =========== wikimedia commons videos search
  router.get('/wikimediaCommons/videos', controller.searchWikiCommonsVideos)

  // =========== wikimedia commons categories search
  router.get('/wikimediaCommons/categories', controller.searchWikiCommonsCategories);

  // =========== bing image search
  router.get('/bing/images', controller.searchBingImages);
  // =========== gif search
  router.get('/gifs', controller.searchBingGifs)

  return router;
}

export default {
  mount,
};
