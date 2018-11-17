const path = require('path')
const fs = require('fs')
const url = require('url')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

const envPublicUrl = process.env.PUBLIC_URL

function ensureSlash(needlePath, needsSlash) {
  const hasSlash = needlePath.endsWith('/')
  if (hasSlash && !needsSlash) {
    return needlePath.substr(needlePath, needlePath.length - 1)
  } else if (!hasSlash && needsSlash) {
    return `${needlePath}/`
  }
  return needlePath
}

module.exports = {
  appBuild: resolveApp('build'),
  appNodeModules: resolveApp('node_modules'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('client/src/app.js'),
  appPackageJson: resolveApp('package.json'),
  appPublic: resolveApp('public'),
  appSrc: resolveApp('client/src'),
  publicUrl: '/',
  servedPath: '/',
  yarnLockFile: resolveApp('yarn.lock'),
}
