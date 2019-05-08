import { httpGet, httpPost, makeCallback, httpDelete } from './Common'
import request from '../utils/requestAgent'

function fetchArticleHumanVoice({ title, wikiSource, lang }) {
  const url = `/api/humanvoice/?title=${encodeURIComponent(title)}&wikiSource=${wikiSource}&lang=${lang}`;

  return httpGet(url)
  .then((res) => ({ humanvoice: res.body.humanvoice }))
  .catch((reason) => { throw { error: 'FAILED', reason } })
}

function uploadSlideAudio({ title, wikiSource, lang, slideNumber, blob, enableAudioProcessing }) {
  const url = `/api/humanvoice/audios`;

  return request.post(url)
  .field('title', title)
  .field('wikiSource', wikiSource)
  .field('position', slideNumber)
  .field('lang', lang)
  .field('enableAudioProcessing', enableAudioProcessing)
  .field('file', blob)
  .then((res) => ({
    slideAudioInfo: res.body.slideAudioInfo,
    humanvoice: res.body.humanvoice,
  }))
  .catch((reason) => { throw { error: 'FAILED', reason } })
}

function saveTranslatedText({ title, wikiSource, lang, slideNumber, text }) {
  const url = `/api/humanvoice/translated_text`;
  const data = {
    title,
    wikiSource,
    lang,
    position: slideNumber,
    text,
  }
  return httpPost(url, data)
  .then(({ body }) => ({
    translatedTextInfo: body.translatedTextInfo,
    humanvoice: body.humanvoice,
  }))
  .catch((reason) => { throw { error: 'FAILED', reason } })
}

function deleteCustomAudio({ title, wikiSource, lang, slideNumber }) {
  const url = `/api/humanvoice/audios`;
  const data = {
    title,
    wikiSource,
    lang,
    position: slideNumber,
  }

  return httpDelete(url, data)
  .then((res) => ({
    deletedAudio: res.body.deletedAudio,
  }))
  .catch((reason) => { throw { error: 'FAILED', reason } })
}

export default {
  uploadSlideAudio,
  fetchArticleHumanVoice,
  saveTranslatedText,
  deleteCustomAudio,
}
