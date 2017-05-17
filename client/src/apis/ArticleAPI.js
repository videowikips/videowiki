import { httpGet } from './Common'

function fetchArticle ({ title }) {
  const url = `/api/wiki/article?title=${encodeURIComponent(title)}`
  return httpGet(url).then(
    ({ text }) => ({
      article: JSON.parse(text),
    }),
  )
}

export default {
  fetchArticle,
}
