import Queue from 'bull'
import wiki from 'wikijs'
import request from 'request'
import AWS from 'aws-sdk'
import fs from 'fs'
import uuidV4 from 'uuid/v4'
import async from 'async'
import path from 'path'
import slug from 'slug'

import Article from '../../models/Article'

import { paragraphs, splitter } from '../../utils'

const convertQueue = new Queue('convert-articles', 'redis://127.0.0.1:6379')

const console = process.console

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

const getMainImage = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${title}&formatversion=2`
  request(url, (err, response, body) => {
    const defaultImage = '/img/default_profile.png'

    if (err) {
      callback(defaultImage)
    }

    try {
      body = JSON.parse(body)
      const { pages } = body.query

      const { thumbnail } = pages[0]
      if (thumbnail) {
        const image = thumbnail.original || defaultImage
        callback(image)
      } else {
        callback(defaultImage)
      }
    } catch (e) {
      callback(defaultImage)
    }
  })
}

const search = function (searchTerm, limit = 5, callback) {
  wiki().search(searchTerm, limit)
    .then((data) => callback(null, data.results))
    .catch((err) => callback(err))
}

const getPageContentHtml = function (title, callback) {
  wiki().page(title)
    .then((page) => page.html())
    .then((result) => {
      callback(null, result)
    })
    .catch((err) => callback(err))
}

const getSectionsFromWiki = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${title}&prop=sections`
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    body = JSON.parse(body)

    const introSection = {
      title: 'Overview',
      toclevel: 1,
      tocnumber: '',
      index: 0,
    }

    if (body && body.parse) {
      const { sections } = body.parse

      const parsedSections = sections.map((section) => {
        const { line } = section
        const regex = /(<([^>]+)>)/ig

        const s = {
          title: line.replace(regex, ''),
          toclevel: section.toclevel,
          tocnumber: section.number,
          index: section.index,
        }

        return s
      })

      const allSections = [introSection].concat(parsedSections)

      callback(null, allSections)
    } else {
      callback(null, [introSection])
    }
  })
}

const getTextFromWiki = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${title}&explaintext=1&exsectionformat=wiki`
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    body = JSON.parse(body)

    if (body && body.query) {
      const { pages } = body.query
      let extract = ''

      if (pages) {
        for (const page in pages) {
          if (pages.hasOwnProperty(page)) {
            extract = pages[page]['extract']
            break
          }
        }
        callback(null, extract)
      } else {
        callback(null, '')
      }
    } else {
      callback(null, '')
    }
  })
}

const getSectionText = function (title, callback) {
  getTextFromWiki(title, (err, text) => {
    if (err) {
      return callback(err)
    }

    getSectionsFromWiki(title, (err, sections) => {
      if (err) {
        return callback(err)
      }

      let remainingText = text

      const updatedSections = []

      // Extract sections from complete text
      for (let i = 1; i < sections.length; i++) {
        const { title, toclevel } = sections[i]
        const numEquals = Array(toclevel + 2).join('=')
        const regex = new RegExp(`${numEquals} ${title} ${numEquals}`, 'i') // == <title> ==
        if (remainingText) {
          const match = remainingText.split(regex)
          const [text, ...remaining] = match
          sections[i-1]['text'] = match[0]
          remainingText = remaining.join(numEquals + ' ' + title + ' ' + numEquals)

        }
        updatedSections.push(sections[i-1])

        // Note - last section is external links and is removed from the sections list
      }
      callback(null, updatedSections)
    })
  })
}

const breakTextIntoSlides = function (title, job, callback) {
  const article = {
    slug: slug(title),
    title,
    converted: false,
  }

  Article.findOneAndUpdate({ title }, article, { upsert: true }, (err) => {
    if (err) {
      console.log(err)
      return callback(err)
    }
    getMainImage(title, (image) => {
      article['image'] = image

      getSectionText(title, (err, sections) => {
        if (err) {
          console.log(err)
          return callback(err)
        }

        article['sections'] = sections
        article['slides'] = []

        const slides = []

        const updatedSections = []

        const sectionFunctionArray = []
        let currentPosition = 0

        sections.map((section) => {
          // Break text into 300 chars to create multiple slides
          const { text } = section
          const paras = paragraphs(text)
          let slideText = []

          paras.map((para) => {
            slideText = slideText.concat(splitter(para, 300))
          })

          section['numSlides'] = slideText.length
          section['slideStartPosition'] = currentPosition

          currentPosition += slideText.length

          const pollyFunctionArray = []

          function s (cb) {
            // For each slide, generate audio file using amazon polly
            slideText.forEach((text, index) => {
              if (text) {
                const params = {
                  'Text': text,
                  'OutputFormat': 'mp3',
                  'VoiceId': 'Joanna',
                }

                console.log(params)

                function p (cb) {
                  Polly.synthesizeSpeech(params, (err, data) => {
                    if (err) {
                      cb(err)
                    } else if (data) {
                      if (data.AudioStream instanceof Buffer) {
                        const filename = `${uuidV4()}.mp3`
                        const randomFileName = path.join(__dirname, '../../../public/audio/' + filename)
                        fs.writeFile(randomFileName, data.AudioStream, (err) => {
                          if (err) {
                            console.log(err)
                            return cb(err)
                          }

                          slides.push({
                            text,
                            audio: `/audio/${filename}`,
                            position: (section['slideStartPosition'] + index),
                          })

                          cb(null)
                        })
                      }
                    }
                  })
                }

                pollyFunctionArray.push(p)
              }
            })

            async.waterfall(pollyFunctionArray, (err) => {
              if (err) {
                console.log(err)
                return callback(err)
              }
              updatedSections.push(section)

              // update progress
              const progressPercentage = Math.floor(updatedSections.length * 100 / sections.length)
              job.progress(progressPercentage)

              cb(null)
            })
          }

          sectionFunctionArray.push(s)
        })

        async.waterfall(sectionFunctionArray, (err) => {
          if (err) {
            console.log(err)
            return callback(err)
          }

          // Save the converted article to DB
          article['content'] = updatedSections
          article['slides'] = slides

          article['converted'] = true
          article['conversionProgress'] = 100

          Article.findOneAndUpdate({ title: article.title }, article, { upsert: true }, (err) => {
            if (err) {
              console.log(err)
              return callback(err)
            }
            callback(null, article)
          })
        })
      })
    })
  })
}

convertQueue.process((job, done) => {
  const { title } = job.data

  console.log(title)

  breakTextIntoSlides(title, job, (err, result) => {
    if (err) {
      console.log(err)
    }

    console.log(result)
    done()
  })
})

convertQueue.on('stalled', (job) => {
  // TODO: log error
})

convertQueue.on('completed', (job, result) => {
  const { title } = job.data
  Article.findOneAndUpdate({ title }, { conversionProgress: 100 }, { upsert: true }, (err) => {
    console.log(err)
  })
})

convertQueue.on('progress', (job, progress) => {
  const { title } = job.data
  console.log('progress------------------------------>')
  console.log(progress)
  console.log(title)
  Article.findOneAndUpdate({ title }, { conversionProgress: progress }, { upsert: true }, (err) => {
    console.log(err)
  })
})

const convertArticleToVideoWiki = function (title, callback) {
  Article.findOne({ title }, (err, article) => {
    if (err) {
      console.log(err)
      return callback('Error while converting article!')
    }

    if (article) {
      return callback(null, 'Article already converted or in progress!')
    }

    convertQueue.add({ title })
    callback(null, 'Job queued successfully')
  })
}

export {
  search,
  getPageContentHtml,
  getSectionsFromWiki,
  getTextFromWiki,
  getSectionText,
  breakTextIntoSlides,
  convertArticleToVideoWiki,
}
