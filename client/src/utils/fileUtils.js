 module.exports = {
   downloadFile(url) {
     const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
     const isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
     // if user is navigating from iphone, which doesnt support direct download
     // inform them
     const iphoneRegex = /(iP)/g
     if (iphoneRegex.test(navigator.userAgent)) {
       alert('Your device does not support files downloading.');
       return false;
     }

     if (isChrome || isSafari) {
       const link = document.createElement('a');
       link.href = url;
       if (link.href.indexOf('?') === -1) {
         link.href += '?download';
       }
       link.target = '_blank';

       const fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
       link.download = fileName;
       if (document.createEvent) {
         const e = document.createEvent('MouseEvents');
         e.initEvent('click', true, true);
         link.dispatchEvent(e);
         return true;
       }
     }

     if (url.indexOf('?') === -1) {
       url += '?download';
     }

     window.open(url, '_self');
     return true;
   },
 }
