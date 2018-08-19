const request = require('superagent');
const baseUrl = 'https://commons.wikimedia.org/w/api.php';

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
                    if (page.imageinfo && page.imageinfo.length > 0) {
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
            console.log(gifs)
            callback(null, gifs);
        })
        .catch(err => callback(err));
}

export {
    fetchImagesFromCommons,
    fetchGifsFromCommons
}