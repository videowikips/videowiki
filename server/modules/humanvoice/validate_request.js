import { Article } from '../shared/models';

const validations = {
  validate_article_exists: (method) => (req, res, next) => {
    let title, wikiSource;
    if (method.toLowerCase() === 'get') {
      title = req.query.title;
      wikiSource = req.query.wikiSource;
    } else {
      title = req.body.title;
      wikiSource = req.body.wikiSource;
    }
    if (!title || !wikiSource) {
      return res.status(500).send('Invalid title or wikiSource');
    }

    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        console.log('error validating article', err);
        return res.status(400).send('Something went wrong');
      }
      if (!article) {
        return res.status(400).send('Invalid article title or wikiSource');
      }
      return next();
    })
  },
}

export default validations;
