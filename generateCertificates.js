const pem = require('pem')
const fs  = require('fs')
const generated = require('debug')('ssl:certificate:generate')
const error = x => {
  require('debug')('ssl:certificate:error')(x)
  process.exit(1)
}
const trusted = require('debug')('ssl:certificate:trust')
const {
  key, cert, address, trustCert
} = require('./options')

const save = ({ certificate, clientKey, authority }) => {
  const dir = require('path').dirname(key)
  fs.mkdirSync(dir)
  fs.writeFileSync(key, clientKey)
  generated(key)
  fs.writeFileSync(cert, certificate)
  generated(cert)
  Object.keys(authority).forEach(name => {
    fs.writeFileSync(`${dir}/ca.${name}.pem`, authority[name])
    generated(`${dir}/ca.${name}.pem`)
  })
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
  trusted(cert)
})
.then(() => process.exit())


module.exports = {generate, trust}
