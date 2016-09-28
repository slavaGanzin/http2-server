const pem = require('pem')
const fs  = require('fs')
const log = require('debug')('ssl:certificate')
const error = require('debug')('ssl:certificate:error')
const {
  key, cert, ca, address, trustCert
} = require('./options')

const save = ( { certificate, clientKey, authority } ) => {
  fs.mkdirSync(require('path').dirname(key))
  fs.writeFileSync(key,  clientKey)
  log(`generated ${key}`)
  fs.writeFileSync(cert, certificate)
  log(`generated ${cert}`)
  fs.writeFileSync(ca, authority)
  log(`generated ${ca}`)
}

const generate = () => new Promise((resolve, reject) =>
 pem.createCertificate({
   commonName: `Certificate Authority ${address}`
 }, (e, authority) => {
   if (e) return reject(e)
   pem.createCertificate({
     commonName: address,
     serviceKey: authority.serviceKey,
     serviceCertificate: authority.certificate,
     serial: Date.now()
   }, (e, {certificate, clientKey}) => {
     if (e) return reject(e)
     resolve({certificate, clientKey, authority})
   })
 })
)
.then(save)
.then(trust)
.catch(error)

const trust = () => new Promise((resolve, reject) => {
  if (!trustCert) return resolve()
  require('child_process').execSync(
    `certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n ${cert} -i ${cert}`
  )
  log(`trusted ${cert}`)
})
.then(() => process.exit())
                                                      

module.exports = {generate, trust}
