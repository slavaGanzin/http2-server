const debug       = require('debug')
const fs          = require('fs')
const {path}      = require('./options')

const [pushDebug,    pushError] = [
  'http2:push', 'http2:error:push'
].map(debug)

let fileByRefferer = {}

const servePush = (req, res, next) => {
  if (fileByRefferer[req.url]) {
    fileByRefferer[req.url].forEach( file => {
      const stream = res.push(file, { });
      stream.on('error', pushError);
      fs.readFile(path+'/'+file, (e, content) => stream.end(content))
    })
  }
  next()
}

const rememberReferrers = (req, res, next) => {
  if (req.headers.referer) {
    const referer = req.headers.referer.replace(/.*:\d*/,'')
    pushDebug(referer, req.url)
    if (!fileByRefferer[referer]) fileByRefferer[referer] = []
    fileByRefferer[referer].push(req.url)
  }
  next()
}

module.exports = [servePush, rememberReferrers]
