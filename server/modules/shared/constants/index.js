export const IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'svg', 'tif', 'tiff', 'webp', 'jif', 'jfif', 'jp2','jpx','j2k', 'j2c', 'fpx', 'pcd'];
export const VIDEOS_EXTESION = ['webm', 'mp4', 'ogg', 'ogv'];
export const GIF_EXTESIONS = ['gif'];
export const HEADING_TAGS = ['h6', 'h5', 'h4', 'h3', 'h2', 'h1'];

export const CUSTOM_VIDEOWIKI_LANG_PREFIXES = {
  'en': 'Wikipedia:Videowiki/',
  'hi': 'विकिपीडिया:वीडियोविकि/',
  'ar': 'ويكيبيديا:فيديوويكي/',
  'es': 'Wikipedia:Videowiki/ES/',
  'ja': 'Wikipedia:ビデオウィキ/',
  'uk': 'Вікіпедія:відеовікі/',
}

export const customVideowikiPrefixes = Object.keys(CUSTOM_VIDEOWIKI_LANG_PREFIXES).map((key) => CUSTOM_VIDEOWIKI_LANG_PREFIXES[key]).concat([
  '/sandbox',
  '/ملعب',
  'ملعب/',
  'taller',
]);

export const SECTIONS_BLACKLIST = {
  'en': ['notes', 'further reading', 'references', 'external links', 'sources', 'footnotes', 'bibliography', 'see also'],
  'hi': ['सन्दर्भ', 'संदर्भ', 'इन्हें भी देखें', 'बाहरी कड़ियाँ', 'टिप्पणी', 'समर्थन'],
  'fr': ['Notes et références', 'Notes', 'Références', 'Annexes', 'Bibliographie', 'Articles connexes', 'Liens externes', 'Voir aussi', 'Sources'],
  'es': ['Notas', 'Véase también', 'Referencias', 'Bibliografía', 'Enlaces externos'],
  'ar': ['انظر ايضاً', 'وصلات خارجية', 'الوصلات الخارجية', 'المراجع', 'مراجع', 'روابط'],
  'ja': ['出典'],
  'uk': ['Посилання', 'примітки', 'Подальше читання', 'зовнішні посилання', 'джерела', 'Дивіться також'],
};

export const SLIDES_BLACKLIST = {
  'en': ['template:info videowiki'],
  'hi': [],
  'fr': [],
  'es': [],
  'ar': [],
  'ja': [],
}

export const FILE_MATCH_REGEX = {
  'en': /\[\[\s*File:(.*)\]\]/gim,
  'ar': /\[\[ملف:(.*)\]\]/gim,
  'es': /\[\[Archivo:(.*)\]\]|\[\[File:(.*)\]\]/gim,
  'ja': /\[\[\s*ファイル:(.*)\]\]/gim,
  'uk': /\[\[Файл:(.*)\]\]|\[\[File:(.*)\]\]/gim,
}

export const FILE_PREFIXES = {
  'en': 'File:',
  'ar': 'ملف:',
  'es': 'Archivo:',
  'ja': 'ファイル:',
  'uk': 'Файл:',
}
