const { expect }  = require('chai')
const needle      = require('needle')
const yadda       = require('yadda')
const { English } = yadda.localisation
const { spawn, execSync }   = require('child_process')
const debug       = require('debug')
const R           = require('ramda')
const [key, cert] = ['tests/certs/key.pem', 'tests/certs/cert.pem']
const defaultArgs = `--key ${key} --cert ${cert} `

const dictionary  = new yadda.Dictionary()
  .define('args', /(.*)/, (args, cb) => cb(null, defaultArgs + args))
  .define('url', /(.*)/)

let server = null

module.exports = English.library(dictionary)

.given('spawn $args', (args, next) => {
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
.given('exec $args', (args, next) => {
  try {
    execSync(R.tap(debug('test:server:exec'), `./http2-server ${args}`))
    next()
  } catch(e) {
    throw new Error(e.stderr.toString('utf8'))
  }
})
.given('remove certificates if exists', next => {
  execSync('rm -rf `dirname '+key+'`')
  next()
})
.then('request $url', (url, next) => {
  needle.get(url, {rejectUnauthorized: false}, (error, response) => {
    if (!error && response.statusCode == 200) return next()
    next(error)
  })
})
.then('shutdown server', next => server.kill() && next() )
