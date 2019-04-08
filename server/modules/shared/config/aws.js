module.exports = {
  bucketName: process.env.AWS_IMAGES_BUCKET_NAME,
  user: process.env.AWS_IMAGES_USER,
  accessKeyId: process.env.AWS_IMAGES_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_IMAGES_BUCKET_ACCESS_SECRET,
  url: process.env.CLOUDFRONT_URL,
  LANG_VOICES: {
    'en-US': 'Joanna',
    'hi-IN': 'Aditi',
    'fr-CA': 'Chantal',
    'es-US': 'Penelope',
  },
  LANG_CODES: {
    'en': 'en-US',
    'hi': 'hi-IN',
    'fr': 'fr-CA',
    'es': 'es-US',
  },
}
