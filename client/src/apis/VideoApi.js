import { httpGet, httpPost } from './Common';

function exportArticleToVideo(formData) {
  const url = '/api/videos/convert';
  return httpPost(url, formData).then(
    ({ text }) => ({
      text,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchVideoHistory({ title, wikiSource }) {
  const url = `/api/videos/history?title=${title}&wikiSource=${wikiSource}`;
  return httpGet(url)
  .then(
    ({ body }) => ({
      videos: body.videos,
    }),
  )
  .catch((reason) => { throw { error: 'FAILED', reason } })
}

export default {
  exportArticleToVideo,
  fetchVideoHistory,
}
