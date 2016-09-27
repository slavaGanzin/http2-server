const fs  = require('fs')
const sslError = require('debug')('http2:error:ssl')
const {
  key, cert, ssl
} = require('./options')

const readCertificates = () => {
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
  readCertificates()
  .then(getOptions)
  .catch(sslError)
