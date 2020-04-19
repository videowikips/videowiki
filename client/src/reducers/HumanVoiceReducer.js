import { mergeImmutable } from '../utils'
import actions from '../actions/HumanVoiceActionCreators'

const initialState = {
  uploadAudioToSlideState: 'done',
  uploadedSlideAudio: null,
  fetchArticleHumanVoiceState: 'done',
  humanvoice: null,
  deleteCustomAudioState: 'done',
  deletedAudio: null,
  saveTranslatedTextState: 'done',
  translatedTextInfo: null,
}

const handlers = {
  [actions.UPLOAD_SLIDE_AUDIO_HUMANVOICE_REQUEST]: (state) =>
    mergeImmutable(state, {
      uploadAudioToSlideState: 'loading',
    }),
  [actions.UPLOAD_SLIDE_AUDIO_HUMANVOICE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      uploadAudioToSlideState: 'done',
      uploadedSlideAudio: action.slideAudioInfo,
      humanvoice: action.humanvoice,
    }),
  [actions.UPLOAD_SLIDE_AUDIO_HUMANVOICE_FAILED]: (state) =>
    mergeImmutable(state, {
      uploadAudioToSlideState: 'failed',
    }),

  [actions.FETCH_ARTICLE_HUMAN_VOICE_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchArticleHumanVoiceState: 'loading',
    }),
  [actions.FETCH_ARTICLE_HUMAN_VOICE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchArticleHumanVoiceState: 'done',
      humanvoice: action.humanvoice,
    }),

  [actions.FETCH_ARTICLE_HUMAN_VOICE_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchArticleHumanVoiceState: 'failed',
      humanvoice: null,
    }),

  [actions.DELETE_CUSTOM_AUDIO_REQUEST]: (state) =>
    mergeImmutable(state, {
      deleteCustomAudioState: 'loading',
      deletedAudio: null,
    }),
  [actions.DELETE_CUSTOM_AUDIO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      deleteCustomAudioState: 'done',
      deletedAudio: action.deletedAudio,
    }),
  [actions.DELETE_CUSTOM_AUDIO_FAILED]: (state) =>
    mergeImmutable(state, {
      deleteCustomAudioState: 'failed',
      deletedAudio: null,
    }),

  [actions.SAVE_TRANSLATED_TEXT_REQUEST]: (state) =>
    mergeImmutable(state, {
      saveTranslatedTextState: 'loading',
      translatedTextInfo: null,
    }),
  [actions.SAVE_TRANSLATED_TEXT_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      saveTranslatedTextState: 'done',
      translatedTextInfo: action.translatedTextInfo,
      humanvoice: action.humanvoice,
    }),
  [actions.SAVE_TRANSLATED_TEXT_FAILED]: (state) =>
    mergeImmutable(state, {
      saveTranslatedTextState: 'failed',
      translatedTextInfo: null,
    }),

}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
