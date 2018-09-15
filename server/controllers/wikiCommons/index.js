const request = require('superagent');
const baseUrl = 'https://commons.wikimedia.org/w/api.php';
const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'svg', 'svg+xml'];

const ALLOWED_VIDEOS_FORMATS = ['ogv', 'webm'];
const ALLOWED_VIDEOS_MIMES = ['video/webm', 'application/ogg'];

const fetchImagesFromCommons = function (searchTerm, callback) {
  const url = `${baseUrl}?action=query&generator=search&gsrnamespace=0|6&gsrsearch="${searchTerm}"&gsrlimit=50&prop=imageinfo&iiprop=url|mime|thumbmime&iiurlwidth=400px&format=json`
  // const url = `${baseUrl}?action=query&list=allimages&ailimit=20&aifrom="${searchTerm}"&aiprop=url&format=json&formatversion=2`

  const options = {
    url
  }

  request.get(url)
    .then(response => {
      let responseBody;
      try {
        responseBody = JSON.parse(response.text);
      } catch (e) {
        console.log(e);
      }

      let images = [];
      // parse response content 
      if (responseBody && responseBody.query && responseBody.query.pages) {
        Object.keys(responseBody.query.pages).forEach(pageId => {
          let page = responseBody.query.pages[pageId.toString()];
          // filter only allowed images formats
          if (page.imageinfo && page.imageinfo.length > 0 && page.imageinfo[0].mime && ALLOWED_IMAGE_FORMATS.indexOf(page.imageinfo[0].mime.split('/')[1]) > -1) {
            images.push(page.imageinfo[0]);
          }
        })
      }

      // replace images url with thumb urls, if exists
      images.forEach(image => {
        if (image && image.thumburl) {
          image.url = image.thumburl;
        }
      })
      console.log(images)
      callback(null, images);

    })
    .catch(err => callback(err));
}

const fetchGifsFromCommons = function (searchTerm, callback) {
  const url = `${baseUrl}?action=query&generator=search&gsrnamespace=0|6&gsrsearch=/^${searchTerm} .*gif$/&gsrlimit=50&prop=imageinfo&iiprop=url|mime&iiurlwidth=400px&format=json`;

  const options = {
    url
  }

  request.get(url)
    .then(response => {
      let responseBody;
      try {
        responseBody = JSON.parse(response.text);
      } catch (e) {
        console.log(e);
      }

      let gifs = [];

      // parse response content
      if (responseBody && responseBody.query && responseBody.query.pages) {
        Object.keys(responseBody.query.pages).forEach(pageId => {
          let page = responseBody.query.pages[pageId.toString()];
          // include only returned GIF files
          if (page.imageinfo && page.imageinfo.length > 0 && page.imageinfo[0].mime && page.imageinfo[0].mime.indexOf('gif') > -1) {
            gifs.push(page.imageinfo[0]);
          }
        })
      }

      callback(null, gifs);
    })
    .catch(err => callback(err));
}

const fetchVideosFromCommons = function (searchTerm, callback) {
  let searchFunctionsArray = [];
  let filesUrls = [];

  ALLOWED_VIDEOS_FORMATS.forEach(fileFormat => {
    let formatSearch = new Promise((resolve, reject) => {

      const url = `${baseUrl}?action=query&generator=search&gsrnamespace=0|6&gsrsearch=/^${searchTerm} .*${fileFormat}$/&gsrlimit=20&prop=imageinfo&iiprop=url|mime&format=json`;

      const options = {
        url
      }

      request.get(url)
        .then(response => {
          let responseBody;
          try {
            responseBody = JSON.parse(response.text);
          } catch (e) {
            console.log(e);
          }

          let videos = [];

          // parse response content
          if (responseBody && responseBody.query && responseBody.query.pages) {

            Object.keys(responseBody.query.pages).forEach(pageId => {
              let page = responseBody.query.pages[pageId.toString()];
              // include only returned GIF files
              if (page.imageinfo && page.imageinfo.length > 0 &&
                page.imageinfo[0].mime && ALLOWED_VIDEOS_MIMES.indexOf(page.imageinfo[0].mime) > -1 &&
                filesUrls.indexOf(page.imageinfo[0].url) == -1

              ) {
                videos.push(page.imageinfo[0]);
              }
            })
          }
          // callback(null, videos);
          resolve(videos);
        })
        .catch(err => resolve([]));
    })

    searchFunctionsArray.push(formatSearch);
  })

  Promise.all(searchFunctionsArray)
    .then(videos => {
      if (videos && videos.length > 0) {
        videos = videos.reduce((total, current) => [...total, ...current], [])
      }
      callback(null, videos);
    })
    .catch(err => {
      console.log(err);
      callback(null, []);
    })
}

const fetchCategoriesFromCommons = function (searchTerm, callback) {
  const url = `${baseUrl}?action=query&generator=allcategories&gacprefix=${searchTerm}&format=json`;

  const options = {
    url
  }

  request.get(url)
    .then(response => {
      let responseBody;
      try {
        responseBody = JSON.parse(response.text);
      } catch (e) {
        console.log(e);
      }

      let categories = [];

      // parse response content
      if (responseBody && responseBody.query && responseBody.query.pages) {
        Object.keys(responseBody.query.pages).forEach(pageId => {
          let page = responseBody.query.pages[pageId.toString()];
          categories.push({ title: page.title });
        })
      }

      callback(null, categories);
    })
    .catch(err => callback(err));
}

export {
  fetchImagesFromCommons,
  fetchGifsFromCommons,
  fetchVideosFromCommons,
  fetchCategoriesFromCommons
}