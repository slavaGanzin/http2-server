const pem = require('pem')
const fs  = require('fs')
const log = require('debug')('ssl:certificate')
const error = require('debug')('ssl:certificate:error')
const {
  key, cert, address, trustCert
} = require('./options')

const save = ( { certificate, clientKey } ) => {
  fs.mkdirSync(require('path').dirname(key))
  fs.writeFileSync(key,  clientKey)
  log(`${key} generated`)
  fs.writeFileSync(cert, certificate)
  log(`${cert} generated`)
}

const generate = () => new Promise((resolve, reject) =>
 pem.createCertificate({
   commonName: `CA ${address}`
 }, (e, ca) => {
   if (e) return reject(e)
   pem.createCertificate({
     commonName: `${address}`,
     serviceKey: ca.serviceKey,
     serviceCertificate: ca.certificate,
     serial: Date.now()
   }, (e, {certificate, clientKey}) => {
     if (e) return reject(e)
     resolve({certificate, clientKey, ca})
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
  log(`${cert} trusted`)
})
.then(() => process.exit())
                                                      

module.exports = {generate, trust}
