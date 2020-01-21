import { IMAGE_EXTENSIONS, VIDEOS_EXTESION, GIF_EXTESIONS } from '../constants.js';

export const getUrlMediaType = function(url) {
  const extension = url.split('.').pop().toLowerCase();
  if (IMAGE_EXTENSIONS.indexOf(extension) !== -1) return 'image';
  if (VIDEOS_EXTESION.indexOf(extension) !== -1) return 'video';
  if (GIF_EXTESIONS.indexOf(extension) !== -1) return 'gif';
  return false;
}

export function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this, args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export function formatTime(milliseconds) {
  if (!milliseconds) return '00:00';
  let seconds = milliseconds / 1000;
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - (hours * 3600)) / 60);
  let millisecs = milliseconds % 1000;
  seconds = seconds - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  let time = minutes + ':' + seconds;
  return time.substr(0, 5);
}