import cheerio from 'cheerio';
import request from 'request'
import wiki from 'wikijs';
import { HEADING_TAGS } from '../../constants';
import { getUrlMediaType } from '../../utils/helpers';

const console = process.console;

export const getArticleMedia = function(title, wikiSource, callback) {
  wiki({
    apiUrl: `${wikiSource}/w/api.php`,
    origin: null,
  }).page(title)
  .then((page) => page.html())
  .then((pageHtml) => {
    const $ = cheerio.load(pageHtml);
    const sectionMedia = [];
    // First we collect all images for each section,
    // then we normalize their urls to their original urls ( instead of thumbnail images )
    $('img').each(function() {
      const sectionTitle = $(this).parentsUntil('.mw-parser-output').prevUntil(HEADING_TAGS.join(',')).prev().last().text().replace(/\[.*\]/g, '');
      const mediaUrl = $(this).attr('src');
      if (sectionMedia.length === 0) {
        sectionMedia.push({ title: sectionTitle, media: [{ url: mediaUrl }] });
      } else {
        const sectionIndex = sectionMedia.findIndex((section) => section.title.toLowerCase().trim() === sectionTitle.toLowerCase().trim());
        if (sectionIndex === -1) {
          sectionMedia.push({ title: sectionTitle, media: [{ url: mediaUrl }] });
        } else {
          sectionMedia[sectionIndex].media.push({ url: mediaUrl });
        }
      }
    })
    // Normalize thumbnail urls
    sectionMedia.forEach((section) => {
      section.media.forEach((image, index) => {
        const urlParts = image.url.split('/').filter((a) => a && a !== 'thumb');
        // Check if t he last item is a custom thumb
        if (urlParts[urlParts.length - 1].match(/[0-9]+px-thumbnail\./)) {
          urlParts.pop();
        }
        // Remove thumbnail part
        if (urlParts.length > 2 && urlParts[urlParts.length - 1].trim().toLowerCase().indexOf(urlParts[urlParts.length - 2].trim().toLowerCase()) !== -1) {
          urlParts.pop();
        }
        if (urlParts.indexOf('https:/') !== 0) urlParts.unshift('https:/');
        section.media[index] = {
          url: urlParts.join('/'),
          type: getUrlMediaType(urlParts.join('/')),
        };
      })
    })
    return callback(null, sectionMedia);
  })
  .catch((err) => callback(err));
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
// fetchArticleRevisionId('User:Hassan.m.amin/sandbox', 'https://en.wikipedia.org', (err, version) => {
//   console.log('version ', err, version);
// })
