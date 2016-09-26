#!/usr/bin/env node
'use strict'
process.env.DEBUG = process.env.DEBUG || 'http2,http2:error*'

const app         = require('express')()
const debug       = require('debug')

const {
  port, address, cert, key, silent, push, cache, maxAge,
  log, cors, open, ssl, gzip, autoindex, index,
  args: [
    path = '.'
  ]
} = require('./options')

const protocol = ssl ? 'https' : 'http'

const onServerStart = () => {
  debug('http2')(
    `${ssl ? 'Http2/Https' : 'Http'} server started on ${protocol}://${address}:${port}
Serve static from ${path}`)
  require('./open')({open, protocol, address, port})
}

require('pem').createCertificate({days:1, selfSigned:true}, (err, {serviceKey, certificate}) => {
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
  
  app.use(require('serve-static')(path, { index, maxAge, cacheControl: cache }))
  
  if (autoindex)    app.use(require('serve-index')(path))
  
  require('spdy').createServer(options, app)
    .listen(port, address, onServerStart)
})
