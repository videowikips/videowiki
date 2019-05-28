import cheerio from 'cheerio';
import request from 'request'
import wiki from 'wikijs';
import { HEADING_TAGS, SECTIONS_BLACKLIST } from '../../constants';
import { getUrlMediaType } from '../../utils/helpers';
import { isCustomVideowikiScript } from '../article';
const lang = process.argv.slice(2)[1];
const VIDEOWIKI_LANG = lang;
const console = process.console;

// export const getArticleMedia = function(title, wikiSource, callback) {
//   console.log('getting article media', title, wikiSource)
//   wiki({
//     apiUrl: `${wikiSource}/w/api.php`,
//     origin: null,
//   }).page(title)
//   .then((page) => page.html())
//   .then((pageHtml) => {
//     const $ = cheerio.load(pageHtml);
//     const sectionMedia = [];
//     // First we collect all images for each section,
//     // then we normalize their urls to their original urls ( instead of thumbnail images )
//     $('img').each(function() {
//       const sectionTitle = $(this).parentsUntil('.mw-parser-output').prevUntil(HEADING_TAGS.join(',')).prev().last().text().replace(/\[.*\]/g, '');
//       const mediaUrl = $(this).attr('src');
//       if (sectionMedia.length === 0) {
//         sectionMedia.push({ title: sectionTitle, media: [{ url: mediaUrl }] });
//       } else {
//         const sectionIndex = sectionMedia.findIndex((section) => section.title.toLowerCase().trim() === sectionTitle.toLowerCase().trim());
//         if (sectionIndex === -1) {
//           sectionMedia.push({ title: sectionTitle, media: [{ url: mediaUrl }] });
//         } else {
//           sectionMedia[sectionIndex].media.push({ url: mediaUrl });
//         }
//       }
//     })
//     // Normalize thumbnail urls
//     sectionMedia.forEach((section) => {
//       section.media.forEach((image, index) => {
//         const urlParts = image.url.split('/').filter((a) => a && a !== 'thumb');
//         // Check if t he last item is a custom thumb
//         if (urlParts[urlParts.length - 1].match(/[0-9]+px-thumbnail\./)) {
//           urlParts.pop();
//         }
//         // Remove thumbnail part
//         if (urlParts.length > 2 && urlParts[urlParts.length - 1].trim().toLowerCase().indexOf(urlParts[urlParts.length - 2].trim().toLowerCase()) !== -1) {
//           urlParts.pop();
//         }
//         if (urlParts.indexOf('https:/') !== 0) urlParts.unshift('https:/');
//         section.media[index] = {
//           url: urlParts.join('/'),
//           type: getUrlMediaType(urlParts.join('/')),
//         };
//       })
//     })
//     return callback(null, sectionMedia);
//   })
//   .catch((err) => callback(err));
// }
export const getArticleMedia = function(title, wikiSource, callback) {
  const fileRegex = /\[\[File:.*\]\]/gim
  const mediaNames = [];
  getSectionWikiContent(title, wikiSource, (err, sections) => {
    // console.log('got sections', err, sections)
    if (err) return callback(err);
    sections.forEach((section) => {
      const mediaMatch = section.text.match(fileRegex);
      if (mediaMatch && mediaMatch.length > 0) {
        // mediaMatch
        mediaMatch.forEach((file) => {
          const fileTitle = file.split('|')[0].replace('[[', '').trim();
          if (!section.rawMedia) {
            section.rawMedia = [fileTitle];
          } else {
            section.rawMedia.push(fileTitle);
          }
          mediaNames.push(fileTitle);
        })
      }
    })
    const titleThumbnailMap = {};
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(mediaNames.join('|'))}&prop=imageinfo&iiprop=url|mediatype&iiurlwidth=400&format=json&formatversion=2`
    request.get(infoUrl, (err, res) => {
      if (err) return callback(err);
      try {
        const pages = JSON.parse(res.body).query.pages;
        // console.log('pages are', pages);
        pages.forEach((page) => {
          if (page.title && page.imageinfo && page.imageinfo.length > 0) {
            titleThumbnailMap[page.title.replace(/\s/g, '_')] = {
              thumburl: page.imageinfo[0].thumburl,
              url: page.imageinfo[0].url,
              type: getUrlMediaType(page.imageinfo[0].url),
            };
          }
        })
      } catch (e) {
        return callback(e);
      }
      sections.filter((section) => section.rawMedia && section.rawMedia.length > 0).forEach((section) => {
        if (!section.media) {
          section.media = [];
        }
        section.rawMedia.forEach((rawMedia) => {
          rawMedia = rawMedia.replace(/\s/g, '_');
          if (titleThumbnailMap[rawMedia]) {
            const item = {
              url: titleThumbnailMap[rawMedia].type === 'image' ? titleThumbnailMap[rawMedia].thumburl : titleThumbnailMap[rawMedia].url,
              origianlUrl: titleThumbnailMap[rawMedia].url,
              type: titleThumbnailMap[rawMedia].type,
            }
            section.media.push(item);
          }
        })
      })
      return callback(null, sections);
    })
  })
}
export const fetchArticleRevisionId = function fetchArticleVersion(title, wikiSource, callback) {
  const url = `${wikiSource}/w/api.php?action=query&format=json&prop=revisions&titles=${encodeURIComponent(title)}&redirects&formatversion=2`
  request(url, (err, response, body) => {
    if (err) {
      return callback(err);
    }

    try {
      body = JSON.parse(body)
      const { pages } = body.query
      const { revisions } = pages[0];
      if (revisions && revisions.length > 0 && revisions[0].revid) {
        return callback(null, revisions[0].revid)
      } else {
        return callback(null, null);
      }
    } catch (e) {
      return callback(e);
    }
  })
}

export const generateDerivativeTemplate = function generateDerivativeTemplate(derivative) {
  return `{{collapse top|{{Template:Derived_from\n|1=${decodeURIComponent(derivative.fileName)}|by=${derivative.author}\n}}}}\n{{${derivative.licence}}}\n{{collapse bottom}}`;
}

export const fetchArticleContributors = function(title, wikiSource, callback = () => {}) {
  const url = `${wikiSource}/w/api.php?action=query&format=json&prop=contributors&titles=${title}&redirects`;
  request.get(url, (err, data) => {
    if (err) {
      console.log(err);
      return callback(err);
    }
    try {
      const body = JSON.parse(data.body);
      let contributors = [];
      Object.keys(body.query.pages).forEach((pageId) => {
        contributors = contributors.concat(body.query.pages[pageId].contributors);
      })
      // contributors = contributors.map((con) => con.name);
      return callback(null, contributors);
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  })
}

function escapeSpecialHtml (str) {
  let text = str
  text = text.replace('&ndash;', '\u2013')
  text = text.replace('&#8211;', '\u2013')

  return text
}

function escapeRegExp (stringToGoIntoTheRegex) {
  /* eslint-disable no-useless-escape */
  return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function getTextFromWiki(wikiSource, title, callback) {
  const url = `${wikiSource}/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURI(title)}&explaintext=1&exsectionformat=wiki&redirects`
  // console.log('url is ', url);
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }
    // console.log('response is ', body, response)

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

export function getSectionsFromWiki(wikiSource, title, callback) {
  const url = `${wikiSource}/w/api.php?action=parse&format=json&page=${encodeURI(title)}&prop=sections&redirects`
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

export function getSectionText(wikiSource, title, callback) {
  getTextFromWiki(wikiSource, title, (err, text) => {
    if (err) {
      return callback(err)
    }

    getSectionsFromWiki(wikiSource, title, (err, sections) => {
      if (err) {
        return callback(err)
      }

      let remainingText = text

      let updatedSections = []

      // Extract sections from complete text
      for (let i = 1; i <= sections.length; i++) {
        if (i < sections.length) {
          sections[i]['title'] = escapeSpecialHtml(sections[i]['title'])
          const { title, toclevel } = sections[i]
          const numEquals = Array(toclevel + 2).join('=')
          const regex = new RegExp(`${numEquals} ${escapeRegExp(title)} ${numEquals}`, 'i') // == <title> ==
          if (remainingText) {
            const match = remainingText.split(regex)
            const [text, ...remaining] = match
            sections[i - 1]['text'] = text.replace(/(=+)(.+)(=+)/g, '');
            remainingText = remaining.join(`${numEquals} ${title} ${numEquals}`)
          }
        } else if (remainingText) {
          sections[i - 1]['text'] = remainingText.replace(/(=+)(.+)(=+)/g, '');
        }

        const previousSection = sections[i - 1]
        const previousSectionTitle = previousSection.title

        if (SECTIONS_BLACKLIST[VIDEOWIKI_LANG].some((s) => previousSectionTitle.toLowerCase().trim() === s.toLowerCase().trim())) {
          //
        } else {
          updatedSections.push(previousSection)
        }
      }
      // If it's a custom videowiki script, remove the overview section
      if (isCustomVideowikiScript(title)) {
        updatedSections.splice(0, 1);
        updatedSections = resetSectionsIndeces(updatedSections)
      }
      callback(null, updatedSections)
    })
  })
}

export function resetSectionsIndeces(sections) {
  const sectionsSlice = sections.slice();
  sectionsSlice.forEach((section, index) => {
    section.index = index;
  })
  return sectionsSlice;
}
function getWikiContentFromWiki(title, wikiSource, callback) {
  fetchArticleRevisionId(title, wikiSource, (err, revid) => {
    if (err) return callback(err);
    const cirrusdocUrl = `${wikiSource}/w/api.php?action=query&format=json&prop=cirrusbuilddoc&revids=${revid}&redirects&formatversion=2`;
    request.get(cirrusdocUrl, (err, res) => {
      if (err) return callback(err);
      const body = JSON.parse(res.body);
      try {
        if (body.query && body.query.pages && body.query.pages.length > 0) {
          const { cirrusbuilddoc } = body.query.pages[0];
          const sourceText = cirrusbuilddoc.source_text;
          if (sourceText) {
            return callback(null, sourceText.replace(/<!--.*-->/gm, '').trim());
          } else {
            return callback(new Error('No info available'));
          }
        }
      } catch (e) {
        console.log('error in catch', e);
        return callback(e);
      }
    })
  })
}

function matchReadShow(text) {
  const re = /{{ReadShow\s*\|\s*read\s*=\s*((?!\|).)*\|show\s*=\s*((?!\}}).)*}}/gm;
  const match = text.match(re);
  return match || [];
}

function parseReadShow(text) {
  const re = /{{ReadShow\s*\|\s*read=(.*)\s*\|\s*show\s*=((?!}}).)*}}/;
  const clearRegex = /}}|\[+|\]+/g;
  const readRegex = /read\s*=\s*/;
  const showRegex = /show\s*=\s*/
  const match = text.match(re);
  const readShow = {};
  if (match.length > 0) {
    const parts = match[0].split('|').map((a) => a.trim());
    parts.forEach((part) => {
      if (part.match(readRegex)) {
        readShow.read = part.replace(readRegex, '').replace(clearRegex, '').trim();
      } else if (part.match(showRegex)) {
        readShow.show = part.replace(showRegex, '').replace(clearRegex, '').trim()
      }
    })
  }
  return readShow;
}

export function getSectionWikiContent(title, wikiSource, callback) {
  getWikiContentFromWiki(title, wikiSource, (err, text) => {
    if (err) {
      return callback(err)
    }

    // console.log('wiki content', text)
    getSectionsFromWiki(wikiSource, title, (err, sections) => {
      if (err) {
        return callback(err)
      }
      let remainingText = text

      const updatedSections = []

      // Extract sections from complete text
      for (let i = 1; i <= sections.length; i++) {
        if (i < sections.length) {
          sections[i]['title'] = escapeSpecialHtml(sections[i]['title'])
          const { title, toclevel } = sections[i]
          const numEquals = Array(toclevel + 2).join('=')
          const regex = new RegExp(`${numEquals} ${escapeRegExp(title)} ${numEquals}|${numEquals}${escapeRegExp(title)}${numEquals}`, 'i') // == <title> ==
          if (remainingText) {
            const match = remainingText.split(regex)
            const [text, ...remaining] = match;
            sections[i - 1]['text'] = text.trim();
            remainingText = remaining.join(`${numEquals} ${title} ${numEquals}`)
          }
        } else if (remainingText) {
          sections[i - 1]['text'] = remainingText.trim();
        }

        const previousSection = sections[i - 1]
        const previousSectionTitle = previousSection.title

        if (SECTIONS_BLACKLIST[VIDEOWIKI_LANG].some((s) => previousSectionTitle.toLowerCase().trim() === s.toLowerCase().trim())) {
          //
        } else {
          updatedSections.push(previousSection)
        }
      }
      callback(null, updatedSections)
    })
  })
}

export function fetchArticleSectionsReadShows(title, wikiSource, callback = () => {}) {
  console.log('getting aread shows')
  getSectionWikiContent(title, wikiSource, (err, sections) => {
    if (err) return callback(err);
    if (!sections) return callback(null, null);
    sections.forEach((section) => {
      if (section.text) {
        const readShow = matchReadShow(section.text).map(parseReadShow);
        section.readShow = readShow;
      }
    })
    return callback(null, sections);
  })
}

export function fetchTitleRedirect(title, wikiSource, callback = () => {}) {
  const url = `${wikiSource}/w/api.php?action=query&titles=${title}&redirects=&format=json&formatversion=2`;
  request.get(url, (err, res) => {
    if (err) return callback(err);
    try {
      const { query } = JSON.parse(res.body);
      if (query.redirects && query.redirects.length > 0) {
        const { to } = query.redirects[0];
        return callback(null, { redirect: true, title: to.replace(/\s/g, '_') });
      } else {
        return callback(null, { redirect: false, title });
      }
    } catch (e) {
      return callback(e);
    }
  })
}

// fetchArticleSectionsReadShows('User:Hassan.m.amin/sandbox', 'https://en.wikipedia.org', (err, readShows) => {
//   console.log(err, readShows)
// })
