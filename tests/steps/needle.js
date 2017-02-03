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

const test = {
  server: null,
  response: null,
  log: null
}
module.exports = English.library(dictionary)
  .define('spawn $args', (args, next) => {
    test.log = []
    debug('test:args')(args)
    test.server = spawn('./http2-server', args.split(' '), {DEBUG:'http2*'})
    test.server.on('close', debug('http2:close'))
    test.server.stdout.on('data', x => {
      test.log.push(x.toString('utf8'))
      debug('http2:stdout')(x.toString('utf8'))
    })
      
    test.server.stderr.on('data', x => {
      x = x.toString('utf8')
      debug('http2:stderr')(x)
      if (R.test(/server started/gim, x)) return next()
    })
  })

  .define('exec $args', (args, next) => {
    try {
      execSync(R.tap(debug('http2:exec'), `./http2-server ${args}`))
      next()
    } catch(e) {
      throw new Error(e.stderr.toString('utf8'))
    }
  })
  .define('remove certificates if exists', next => {
    execSync('rm -rf `dirname '+key+'`')
    next()
  })

  .define('$method $url $status', (method, url, status, next) => {
    needle[method](url, {
      compressed: true,
      rejectUnauthorized: false
    }, (error, response) => {
      error
        ? expect(error.toString()).to.match(new RegExp(status))
        : expect(parseInt(response.statusCode)).to.be.equal(parseInt(status))
      test.response = response
      next()
    })
  })

  .define('response $path has $reg', (path, reg, next) => {
    debug('test:body')(test.response.body)
    debug('test:headers')(test.response.headers)
    expect(R.defaultTo('_EMPTY_', R.path(R.split('.',path), test.response)).toString('utf8')).to.match(new RegExp(reg, 'gim'))
    next()
  })
  .define('shutdown server', next => {
    if (test.server) test.server.kill()
    next()
  })
  .define('log $has $expression', (has, expression, next) => {
    const f = has == 'has' ? R.filter : R.reject
    const result = f(R.test(new RegExp(expression)), test.log)
    debug('http2:log')(result, test.log)
    expect(result).to.be.not.empty()
    next()
  })
  .define('$ms ms', (ms, next) => setTimeout(next, ms))
