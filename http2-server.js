#!/usr/bin/env node
'use strict'
process.env.DEBUG = process.env.DEBUG || 'http2,http2:error*'

const app         = require('express')()
const debugLog    = require('debug')('http2')

const {
  port, address, silent, push, cache, maxAge,
  log, cors, ssl, gzip, autoindex, index, URL, serverType,
  args: [
    path = '.'
  ]
} = require('./options')

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
