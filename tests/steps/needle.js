const { expect }  = require('chai')
const needle      = require('needle')
const yadda       = require('yadda')
const { English } = yadda.localisation
const { spawn, execSync }   = require('child_process')
const debug       = require('debug')
const R           = require('ramda')
const dictionary  = new yadda.Dictionary()
  .define('args', /(.*)/)
  .define('url', /(.*)/)

let server = null

module.exports = English.library(dictionary)
.given('launch server $args', (args, next) => {
  server = spawn('./http2-server', args.split(' '))
  server.on('close', debug('test:server:close'))
  server.stdout.on('data', x =>
    debug('test:server:stdout')(x.toString('utf8')))
    
  server.stderr.on('data', x => {
    x = x.toString('utf8')
    debug('test:server:stderr')(x)
    if (R.test(/server started/gim, x)) return next()
   })
})
.given('generate certs', (next) => {
  try {
    execSync('./http2-server --generate-cert')
    next()
  } catch(e) {
    next(e)
  }
})
.then('request $url', (url, next) => {
  needle.get(url, {rejectUnauthorized: false}, (error, response) => {
    if (!error && response.statusCode == 200) return next()
    next(error)
  })
})
.then('shutdown server', next => server.kill() && next() )
