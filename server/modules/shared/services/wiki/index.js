import cheerio from 'cheerio';
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
