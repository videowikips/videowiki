const request = require('request')

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}

const fetchImagesFromBing = function (searchTerm, callback) {
  const baseUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
  const url = `${baseUrl}?q=${encodeURIComponent(searchTerm)}&count=20&offset=0&safeSearch=Moderate`

  console.log(url)

  const options = {
    url,
    headers: {
      'Ocp-Apim-Subscription-Key': '6f2a19781fb141f8a291080b1770b433',
    },
  }

  request(options, (err, response, body) => {
    if (err) {
      console.log(err)
      return callback(err)
    }

    try {
      body = JSON.parse(body)

      if (body && body.value) {
        const imageList = body.value

        const images = imageList.map((image) => {
          const originalImage = image.contentUrl

          const imageContent = {
            thumbnail: image.thumbnailUrl,
            original: getParameterByName('r', originalImage),
          }

          return imageContent
        })
        callback(null, images)
      } else {
        callback(null, [])
      }
    } catch (e) {
      console.log(e)
      callback(e)
    }
  })
}

const fetchGifsFromGiphy = function (searchTerm, callback) {
  const baseUrl = 'https://api.giphy.com/v1/gifs/search'
  const url = `${baseUrl}?q=${encodeURIComponent(searchTerm)}&count=20&offset=0&safeSearch=Moderate`

  const options = {
    url,
    headers: {
      'api_key': '688f6a71abaf4621a74837947e26f9e1',
    },
  }

  request(options, (err, response, body) => {
    if (err) {
      console.log(err)
      return callback(err)
    }

    try {
      body = JSON.parse(body)

      if (body && body.data) {
        const gifList = body.data

        const gifs = gifList.map((gif) => {
          const originalGif = gif.url


          const gifContent = {
            images: gif.images,
            url: originalGif,
          }

          return gifContent
        })
        callback(null, gifs)
      } else {
        callback(null, [])
      }
    } catch (e) {
      console.log(e)
      callback(e)
    }
  })
}

export {
  fetchImagesFromBing,
  fetchGifsFromBing,
}
