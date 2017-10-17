const fs  = require('fs')
const sslError = require('debug')('http2:error:ssl')
const {
  key, cert, ssl
} = require('./options')

const readCertificates = () => {
  try {
    fs.statSync(key)
    fs.statSync(cert)
  } catch (e) {
    sslError(`Certificates was not found: ${key} or ${cert}. Please review: https://github.com/slavaGanzin/http2-server#ssl-certificates`)
    process.exit(0)
  }
  return Promise.resolve({
    clientKey:   fs.readFileSync(key, 'utf8'),
    certificate: fs.readFileSync(cert, 'utf8')
  })
}

const getOptions = ({certificate, clientKey}) => {
  return {
    key: clientKey,
    cert: certificate,
    ssl,
    spdy: {
      plain: !ssl,
    },
    agent: false,
    strictSSL: false
  }
}

module.exports =
  (ssl
    ? readCertificates()
    : Promise.resolve({certificate: null, clientKey: null}))
  .then(getOptions)
  .catch(sslError)
