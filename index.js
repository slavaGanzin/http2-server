'use strict'

const express = require('express')
const serveStatic = require('serve-static')
const spdy = require('spdy')
const fs = require('fs')
const morganDebug = require('morgan-debug')
const app = express()
const pem = require('pem')
const http = require('http')
const debug = require('debug')
const pushDebug = debug('push')
let port = 8080
let push = {}

const rememberReferrers = (req, res, next) => {
  if (req.headers.referer) {
    const referer = req.headers.referer.replace(/.*:\d*/,'')
    pushDebug(referer, req.url)
    if (!push[referer]) push[referer] = []
    push[referer].push(req.url)
  }
  next()
}

pem.createCertificate({days:1, selfSigned:true}, (err, keys) => {
  var options = {
    key: keys.serviceKey,

    cert: keys.certificate,
    spdy: {
      plain: false,
      
    //   plain: false,
    //   connection: {
    //     windowSize: 1024 * 1024, // Server's window size
    //     autoSpdy31: false
      }
    // }
  };

  app.use((req, res, next) => {
      if (push[req.url]) {
        push[req.url].forEach( file => {
          const stream = res.push(file, { });
          stream.on('error', pushDebug);
          fs.readFile('./'+file, (e, content) => stream.end(content))
        })
    }
    next()
  })
  
  app.get('*', ({secure, hostname, url},res, next) => {
    if (!secure) return res.redirect(`https://${hostname}:${port}${url}`)
    next()
  })
  app.use(require('morgan')('dev'))
  app.use(rememberReferrers)
  app.use(serveStatic('.', { }))
  
  spdy.createServer(options, app).listen(port)
  // http.createServer(app).listen(8080)

})
// spdy.createServer(options, function(req, res) {
//     res.writeHead(200);
//     res.end('Hello world over HTTP/2');
// }).listen(3000);
