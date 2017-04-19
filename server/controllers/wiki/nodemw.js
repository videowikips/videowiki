import nodemw from 'nodemw'

const wiki = new nodemw({
  protocol: 'https',           // Wikipedia now enforces HTTPS
  server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
  path: '/w',                  // path to api.php script
  debug: false,                 // is more verbose when set to true
})

function getPage () {
  wiki.getArticle('Vizslás', (err, data) => {
    // error handling
    if (err) {
      return console.error(err)
    }

    wiki.parse(data, 'Vizslás', (err, result) => {
      // error handling
      if (err) {
        return console.error(err)
      }

      console.log(result)
    })
  })

  /* wiki.search('Elon Musk', (err, data) => {
    // error handling
    if (err) {
      return console.error(err)
    }

    console.log(data)
  }) */

  /* wiki.getImagesFromArticle('Vizslás', (err, data) => {
    // error handling
    if (err) {
      return console.error(err)
    }

    console.log(data)
  }) */
}

module.exports = {
  getPage,
}
