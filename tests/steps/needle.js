const { expect }  = require('chai')
const needle      = require('needle')
const yadda       = require('yadda')
const { English } = yadda.localisation
const { spawn, execSync }   = require('child_process')
const debug       = require('debug')
const R           = require('ramda')
const [key, cert] = ['tests/certs/key.pem', 'tests/certs/cert.pem']
const defaultArgs = `./tests/public --key ${key} --cert ${cert} `

const dictionary  = new yadda.Dictionary()
  .define('args', /(.*)/, (args, cb) => cb(null, defaultArgs + args))
  .define('url', /(.+)/)
  .define('status', /(.+)/)
  .define('method', /(GET|POST|PUT|HEAD)/, (method, cb) => cb(null, method.toLowerCase()))

let _server = null
let _response = null

module.exports = English.library(dictionary)

.given('spawn $args', (args, next) => {
  _server = spawn('./http2-server', args.split(' '), {env: {DEBUG: 'http2'}})
  _server.on('close', debug('http2:close'))
  _server.stdout.on('data', x =>
    debug('http2:stdout')(x.toString('utf8')))
    
  _server.stderr.on('data', x => {
    x = x.toString('utf8')
    debug('http2:stderr')(x)
    if (R.test(/server started/gim, x)) return next()
   })
})
.given('exec $args', (args, next) => {
  try {
    execSync(R.tap(debug('http2:exec'), `./http2-server ${args}`))
    next()
  } catch(e) {
    throw new Error(e.stderr.toString('utf8'))
  }
})
.given('remove certificates if exists', next => {
  execSync('rm -rf `dirname '+key+'`')
  next()
})
.then('$method $url $status', (method, url, status, next) => {
  needle[method](url, {rejectUnauthorized: false}, (error, response) => {
    debug('needle', error, response)
    error
      ? expect(error.toString()).to.match(new RegExp(status))
      : expect(parseInt(response.statusCode)).to.be.equal(parseInt(status))
    _response = response
    next()
  })
})
.then('response $path has $reg', (path, reg, next) => {
  expect(R.path(R.split('.',path), _response).toString('utf8')).to.match(new RegExp(reg, 'gim'))
  next()
})
.then('shutdown server', next => _server.kill() && next() )
