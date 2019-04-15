const accessKeyId = process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY
const secretAccessKey = process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET
const allowedAudioExtensions = ['webm', 'mp3', 'ogg', 'wav']
export {
  accessKeyId,
  secretAccessKey,
  allowedAudioExtensions,
}
