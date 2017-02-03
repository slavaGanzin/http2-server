const debug       = require('debug')
const fs          = require('fs')
const {args:[path = '.']}      = require('./options')

const [pushDebug, pushError] = [
  'http2:push', 'http2:push:error'
].map(debug)

let fileByRefferer = {}

const servePush = (req, res, next) => {
  if (fileByRefferer[req.url] && res.push) {
    fileByRefferer[req.url].forEach(file => {
      const stream = res.push(file, {})
      fs.readFile(path+'/'+file, 'utf8', (e, content) => {
        e && pushError(e)
        stream.end(content)
      })
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
