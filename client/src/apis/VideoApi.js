import { httpGet, httpPost } from './Common';

function exportArticleToVideo(formData, callback) {
  const url = '/api/videos/convert';
  return httpPost(url, formData).then(
    ({ text }) => ({
      text,
    })
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

export default {
  exportArticleToVideo,
}
