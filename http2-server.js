#!/usr/bin/env node
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
const opn         = require('opn')

const {
  port, address, cert, key, silent, push, log, cors, open, ssl,
  args: [
    path = '.'
  ]
} = require('./options')

const [pushDebug,    pushError] = [
      'http2:push', 'http2:push:error'
].map(debug)
const protocol = ssl ? 'https' : 'http'

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
const onServerStart = () => {
  console.log(
    `${ssl ? 'Http2/Https' : 'Http'} server started on ${protocol}://${address}:${port}
Serve static from ${path}`
  )
  if (process.argv.indexOf('-o') > 1) {
    opn(`${protocol}://${address}:${port}`, {
      app: open.split(' '),
    })
    .catch(x => console.error(x.toString().replace('ENOENT','')))
  }
}

pem.createCertificate({days:1, selfSigned:true}, (err, {serviceKey, certificate}) => {
  const options = {
    key:  key  || serviceKey,
    cert: cert || certificate,
    ssl,
    spdy: {
      plain: !ssl,
    }
  }
  if (cors) {
    app.use(require('cors')())
  }
  if (ssl && push) {
    app.use(servePush)
    app.use(rememberReferrers)
  }
  
  if (!silent) app.use(require('morgan')(log))
  app.use(serveStatic('.', { }))
  
  spdy.createServer(options, app)
  .listen(port, address, onServerStart)
})
