import wiki from 'wikijs'

const search = function (searchTerm, limit = 5, callback) {
  wiki().search(searchTerm, limit)
    .then((data) => callback(null, data.results))
    .catch((err) => callback(err))
}

const getPageContentHtml = function (title, callback) {
  wiki().page(title)
    .then((page) => page.html())
    .then((result) => {
      callback(null, result)
    })
    .catch((err) => callback(err))
}

export {
  search,
  getPageContentHtml,
}
