#!/usr/bin/env node
'use strict'
process.env.DEBUG = process.env.DEBUG || 'http2,http2:error*'

const express     = require('express')
const serveStatic = require('serve-static')
const spdy        = require('spdy')
const fs          = require('fs')
const app         = express()
const pem         = require('pem')
const http        = require('http')
const debug       = require('debug')
const opn         = require('opn')

const {
  port, address, cert, key, silent, push, log, cors, open, ssl, gzip, autoindex,
  args: [
    path = '.'
  ]
} = require('./options')

const protocol = ssl ? 'https' : 'http'

const onServerStart = () => {
  debug('http2')(
    `${ssl ? 'Http2/Https' : 'Http'} server started on ${protocol}://${address}:${port}
Serve static from ${path}`)
  if (process.argv.indexOf('-o') > 1) {
    opn(`${protocol}://${address}:${port}`, {
      app: open.split(/\s-+/),
    })
    .catch(x => debug('http2:error:opn')(x.toString().replace('ENOENT','')))
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
  if (cors)         app.use(require('cors')())
  if (gzip)         app.use(require('compression')())
  if (ssl && push)  require('./naivePush')({app, path})
  if (!silent)      app.use(require('morgan')(log))
  if (autoindex)    app.use(require('serve-index')(path))
  
  app.use(serveStatic(path, { }))
  
  spdy.createServer(options, app)
    .listen(port, address, onServerStart)
})
