import { Article } from '../shared/models';
import queryString from 'query-string';

const logoUrl = `${process.env.HOST_URL}/img/logo-large.jpg`;

const controller = {
  getPage(req, res) {
    const parts = req.url.replace('/videowiki/', '').split('?');
    const title = decodeURI(parts[0]);
    const wikiSource = parts.length > 0 ? queryString.parse(parts[1]).wikiSource : null;
    const input = { title };

    if (wikiSource) {
      input.wikiSource = wikiSource;
    }

    Article
      .findOne({ published: true, ...input })
      .exec((err, article) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching articles!')
        }

        if (!article) {
          return res.set('Content-Type', 'text/html').send(`
          <!DOCTYPE html>
          <html lang="en" prefix="og: http://ogp.me/ns#">
          <head>
            <title>VideoWiki: ${title}</title>
            <meta charset="UTF-8" />
            <meta property="og:url" content="${process.env.HOST_URL}/videowiki/${title}?wikiSource=${wikiSource}/" />
            <meta property="fb:app_id" content="314041545858819" />
            <meta property="og:title" content="Videowiki: ${title}" />
            <meta property="og:description" content="Checkout the new VideoWiki article at ${process.env.HOST_URL}/videowiki/${title}?wikiSource=${wikiSource}" />
            <meta property="og:site_name" content="Videowiki" />
            <meta property="og:type" content="article" />
          </head>
          <body>
            <div id="app"></div>
            <script src="/bundle.js"></script>
          </body>
          </html>
        `);
        }

        const imageUrl = article.image && article.image.length > 0 && article.image !== `/img/default_profile.png` ? article.image : logoUrl

        return res.set('Content-Type', 'text/html').send(`
          <!DOCTYPE html>
          <html lang="en" prefix="og: http://ogp.me/ns#">
          <head>
            <title>VideoWiki: ${article.title.split('_').join(' ')}</title>
            <meta charset="UTF-8" />
            <meta property="og:url" content="${process.env.HOST_URL}/videowiki/${article.title}?wikiSource=${wikiSource}/" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="fb:app_id" content="314041545858819" />
            <meta property="og:title" content="Videowiki: ${article.title.split('_').join(' ')}" />
            <meta property="og:description" content="Checkout the new VideoWiki article at ${process.env.HOST_URL}/videowiki/${article.title}?wikiSource=${article.wikiSource}" />
            <meta property="og:site_name" content="Videowiki" />
            <meta property="og:type" content="article" />
          </head>
          <body>
            <div id="app"></div>
            <script src="/bundle.js"></script>
          </body>
          </html>
        `)
      })
  },
};

export default controller;
