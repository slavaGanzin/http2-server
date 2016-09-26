const fs  = require('fs')
const pem = require('pem')
const sslError = require('debug')('http2:error:ssl')
const {
  key, cert, ssl, saveCerts
} = require('./options')
const certPath = `${__dirname}/cert/`

const generateCertificates = (resolve, reject) =>
 pem.createCertificate({
   commonName: 'CA Certificate'
 }, (e, ca) => {
   if (e) return reject(e)
   pem.createCertificate({
     serviceKey: ca.serviceKey,
     serviceCertificate: ca.certificate,
     serial: Date.now()
   }, (e, {certificate, clientKey}) => {
     if (e) return reject(e)
     resolve({certificate, clientKey, ca})
   })
 })
 
const readCertificates = () => {
  return {
    clientKey:   fs.readFileSync(key, 'utf8'),
    certificate: fs.readFileSync(cert, 'utf8')
  }
}
  
const saveCertificates = !saveCerts
  ? cert => cert
  : cert => {
      fs.mkdirSync(certPath)
      fs.writeFileSync(certPath + '/cert.key', cert.clientKey)
      fs.writeFileSync(certPath + '/cert.crt', cert.certificate)
      return cert
    }

const getOptions = ({certificate, clientKey}) => {
  return {
    key: clientKey,
    cert: certificate,
    ssl,
    spdy: {
      plain: !ssl,
    },
    rejectUnauthorized: false,
    requestCert: true,
    agent: false,
    strictSSL: false
  }
}
    
module.exports = Promise.resolve()
 .then(readCertificates)
  .catch(() => new Promise(generateCertificates)
    .then(saveCertificates)
  )
  .then(getOptions)
  .catch(sslError)
