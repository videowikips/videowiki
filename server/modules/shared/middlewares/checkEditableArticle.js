import { Article as ArticleModel } from '../models';

export function checkEditableArticle(req, res, next) {
  const { title, wikiSource } = req.body || req.query;
  ArticleModel.findOne({ title, wikiSource, published: true }, (err, article) => {
    if (err) {
      console.log('error fetching article while validating exportable', err);
      return res.status(400).send('Something went wrong');
    }
    if (!article) {
      return res.status(400).send('Invalid article title or wikiSource');
    }
    if (article.mediaSource === 'script') {
      return res.status(400).send('The media of custom Videowiki articles are editable only in the script page');
    }
    return next();
  })
}
