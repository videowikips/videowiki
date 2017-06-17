import { httpGet, makeCallback } from './Common'
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
        console.log(event)
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

export default {
  fetchArticle,
  uploadContent,
  fetchTopArticles,
  fetchConversionProgress,
  publishArticle,
}
