import { httpGet, httpPost, makeCallback } from './Common'
import request from 'superagent'

function fetchArticle ({ title, mode }) {
  const edit = mode !== 'viewer'
  const url = `/api/wiki/article?title=${encodeURIComponent(title)}&edit=${edit}`
  return httpGet(url).then(
    ({ text }) => ({
      article: JSON.parse(text),
    }),
  )
}

function fetchTopArticles () {
  const url = '/api/articles/top'
  return httpGet(url)
    .then(
      ({ text }) => (JSON.parse(text)),
    )
    .catch((reason) => { throw { error: 'FAILED', reason } })
}

const makeFileUploadMethod = (method) =>
  (url, title, slideNumber, file, headers = {}) =>
    new Promise((resolve, reject) => {
      method(url)
      .set(headers)
      .field('title', title)
      .field('slideNumber', slideNumber)
      .attach('file', file)
      .on('progress', (event) => {
        const uploadStatus = event
        return {
          uploadStatus,
        }
      })
      .end(makeCallback(resolve, reject))
    })

function uploadContent ({ title, slideNumber, file }) {
  const url = '/api/wiki/article/upload'

  return makeFileUploadMethod(request['post'])(url, title, slideNumber, file).then(
    ({ body }) => ({
      uploadStatus: body,
    }),
  )
}

function uploadImageUrl ({ title, slideNumber, url }) {
  const uploadUrl = '/api/wiki/article/imageUpload'

  const data = {
    title,
    slideNumber,
    url,
  }

  return httpPost(uploadUrl, data).then(
    ({ body }) => ({
      uploadStatus: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchConversionProgress ({ title }) {
  const url = `/api/articles/progress?title=${title}`

  return httpGet(url)
    .then(
      ({ text }) => (JSON.parse(text)),
    )
    .catch((reason) => { throw { error: 'FAILED', reason } })
}

function publishArticle ({ title }) {
  const url = `/api/articles/publish?title=${title}`

  return httpGet(url)
    .then(
      ({ text }) => (text),
    )
    .catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchContributors ({ title }) {
  const url = `/api/articles/contributors?title=${title}`

  return httpGet(url).then(
    ({ body }) => ({
      contributors: body.contributors,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchArticleCount () {
  const url = '/api/articles/count'

  return httpGet(url).then(
    ({ body }) => ({
      count: body.count,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchAllArticles ({ offset }) {
  const url = `/api/articles/all?offset=${offset}`

  return httpGet(url).then(
    ({ body }) => ({
      articles: body.articles,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchDeltaArticles ({ offset }) {
  const url = `/api/articles/all?offset=${offset}`

  return httpGet(url).then(
    ({ body }) => ({
      articles: body.articles,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchImagesFromBing ({ searchText }) {
  const url = `/api/articles/bing/images?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      images: body.images,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

export default {
  fetchArticle,
  uploadContent,
  uploadImageUrl,
  fetchTopArticles,
  fetchConversionProgress,
  publishArticle,
  fetchContributors,
  fetchArticleCount,
  fetchAllArticles,
  fetchImagesFromBing,
  fetchDeltaArticles,
}
