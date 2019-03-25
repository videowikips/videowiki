import { httpGet, httpPost, makeCallback } from './Common'
import request from '../utils/requestAgent'

function fetchArticle ({ title, mode, wikiSource }) {
  const edit = mode !== 'viewer'
  let url = `/api/wiki/article?title=${encodeURIComponent(title)}&edit=${edit}`

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`;
  }

  return httpGet(url).then(
    ({ text }) => ({
      article: JSON.parse(text),
    }),
  )
}

function fetchTopArticles () {
  const url = '/api/articles/top?limit=100'
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

function uploadImageUrl ({ title, wikiSource, slideNumber, url, mimetype }) {
  const uploadUrl = '/api/wiki/article/imageUpload'

  const data = {
    title,
    wikiSource,
    slideNumber,
    url,
    mimetype,
  }

  return httpPost(uploadUrl, data).then(
    ({ body }) => ({
      uploadStatus: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchConversionProgress ({ title, wikiSource }) {
  const url = `/api/articles/progress?title=${title}&wikiSource=${wikiSource}`

  return httpGet(url)
    .then(
      ({ text }) => (JSON.parse(text)),
  )
    .catch((reason) => { throw { error: 'FAILED', reason } })
}

function publishArticle ({ title, wikiSource }) {
  let url = `/api/articles/publish?title=${title}`

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`
  }

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

function fetchImagesFromWikimediaCommons ({ searchText }) {
  const url = `/api/articles/wikimediaCommons/images?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      images: body.images,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchGifsFromWikimediaCommons ({ searchText }) {
  const url = `/api/articles/wikimediaCommons/gifs?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      gifs: body.gifs,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchVideosFromWikimediaCommons ({ searchText }) {
  const url = `/api/articles/wikimediaCommons/videos?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      videos: body.videos,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchCategoriesFromWikimediaCommons ({ searchText }) {
  const url = `/api/articles/wikimediaCommons/categories?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      categories: body.categories,
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

function fetchGifsFromGiphy ({ searchText }) {
  const url = `/api/articles/gifs?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      gifs: body.gifs,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchAudioFileInfo ({ file }) {
  const url = `/api/files?filename=${file}`

  return httpGet(url).then(
    ({ body }) => ({
      audioInfo: body.file,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchArticleVideo({ articleId, lang }) {
  const url = `/api/videos/by_article_id/${articleId}?lang=${lang}`;

  return httpGet(url).then(
    ({ body }) => ({
      exported: body.exported,
      video: body.video,
    })
    ,
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchVideoByArticleTitle({ title, wikiSource, lang }) {
  let url = `/api/videos/by_article_title?title=${encodeURIComponent(title)}&wikiSource=${wikiSource}`;

  if (lang) {
    url += `&lang=${lang}`;
  }

  return httpGet(url)
  .then(({ body }) => ({
    video: body.video,
  })).catch((reason) => { throw { error: 'FAILED', reason } });
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
  fetchCategoriesFromWikimediaCommons,
  fetchImagesFromWikimediaCommons,
  fetchGifsFromWikimediaCommons,
  fetchVideosFromWikimediaCommons,
  fetchImagesFromBing,
  fetchGifsFromGiphy,
  fetchDeltaArticles,
  fetchAudioFileInfo,
  fetchArticleVideo,
  fetchVideoByArticleTitle,
}
