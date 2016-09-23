'use strict'

const express     = require('express')
const serveStatic = require('serve-static')
const spdy        = require('spdy')
const fs          = require('fs')
const morganDebug = require('morgan-debug')
const app         = express()
const pem         = require('pem')
const http        = require('http')
const debug       = require('debug')
const pushDebug   = debug('push')
const opn         = require('opn')

const {
  port, address, cert, key, silent, push, log, cors, open
} = require('./options')

let fileByRefferer = {}

const servePush = (req, res, next) => {
  if (fileByRefferer[req.url]) {
    fileByRefferer[req.url].forEach( file => {
      const stream = res.push(file, { });
      stream.on('error', pushDebug);
      fs.readFile('./'+file, (e, content) => stream.end(content))
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
const onServerStart = () => {
  console.log(`Http2 server started on ${address}:${port}`)
  if (process.argv.indexOf('-o') > 1) {
    opn(`https://${address}:${port}`, {app: open.split(' ')})
  }
}

pem.createCertificate({days:1, selfSigned:true}, (err, keys) => {
  const options = {
    key:  key  || keys.serviceKey,
    cert: cert || keys.certificate,
    spdy: {
      plain: false,
    }
  }
  if (cors) {
    app.use(require('cors')())
  }
  if (push) {
    app.use(servePush)
    app.use(rememberReferrers)
  }
  // app.get('*', ({secure, hostname, url},res, next) => {
  //   if (!secure) return res.redirect(`https://${hostname}:${port}${url}`)
  //   next()
  // })
  if (!silent) app.use(require('morgan')(log))
  app.use(serveStatic('.', { }))
  
  spdy.createServer(options, app)
  .listen(port, address, onServerStart)
})
