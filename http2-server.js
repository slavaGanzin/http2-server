#!/usr/bin/env node
'use strict'
process.env.DEBUG = process.env.DEBUG || 'http2,http2:error*,ssl:certificate*'

const app         = require('express')()
const debugLog    = require('debug')('http2')

const {
  port, address, silent, push, cache, maxAge, trustCert,
  log, cors, ssl, gzip, autoindex, index, URL, serverType, generateCert,
  args: [
    path = '.'
  ]
} = require('./options')

if (generateCert) return require('./generateCertificates').generate()
if (trustCert) return require('./generateCertificates').trust()

const onServerStart = () => {
  debugLog(`${serverType} server started on ${URL}`)
  debugLog(`Serve static from ${path}`)
  
  require('./open')()
}

if (cors)         app.use(require('cors')())
if (gzip)         app.use(require('compression')())
if (ssl && push)  require('./naivePush').map(x => app.use(x))
if (!silent)      app.use(require('morgan')(log))

app.use(require('serve-static')(path, { index, maxAge, cacheControl: !!cache }))

if (autoindex)    app.use(require('serve-index')(path))

require('./ssl').then( options =>
  require('spdy')
    .createServer(options, app)
    .listen(port, address, onServerStart)
)
