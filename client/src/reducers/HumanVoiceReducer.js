import { mergeImmutable } from '../utils'
import actions from '../actions/HumanVoiceActionCreators'

const initialState = {
  uploadAudioToSlideState: 'done',
  uploadedSlideAudio: null,
  fetchArticleHumanVoiceState: 'done',
  humanvoice: null,
  deleteCustomAudioState: 'done',
  deletedAudio: null,
}

const handlers = {
  [actions.UPLOAD_SLIDE_AUDIO_REQUEST]: (state) =>
    mergeImmutable(state, {
      uploadAudioToSlideState: 'loading',
    }),
  [actions.UPLOAD_SLIDE_AUDIO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      uploadAudioToSlideState: 'done',
      uploadedSlideAudio: action.slideAudioInfo,
      humanvoice: action.humanVoice,
    }),
  [actions.UPLOAD_SLIDE_AUDIO_FAILD]: (state) =>
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
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)