import { CronJob } from 'cron'
import wikiUpload from './wikiUploadUtils'

const COMMONS_BASE_URL = 'https://commons.wikimedia.org/w/api.php'
const username = process.env.WIKICOMMONS_BOT_USERNAME
const password = process.env.WIKICOMMONS_BOT_PASSWORD
const console = process.console

// const job = new CronJob({
//   cronTime: '30 3 * * *',
//   onTick: function () {
//     // Login to wiki commons
//     wikiUpload.loginToMediawiki(COMMONS_BASE_URL, username, password)
//       .then(() => {
//         console.log('Authenticated with WikiCommons successfully!')
//       })
//       .catch((err) => {
//         console.log('failed to authenticate with WikiCommons', err)
//       })
//   },
//   timeZone: 'Asia/Kolkata',
//   runOnInit: true,
// })

// job.start()
// console.log('Started cron job for authenticating with WikiCommons at', Date())