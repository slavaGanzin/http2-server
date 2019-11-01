const pem = require('pem')
const fs  = require('fs')
const generated = require('debug')('ssl:certificate:generate')
const error = x => {
  require('debug')('ssl:certificate:error')(x)
  const ERROR = 1
  process.exit(ERROR)
}
const trusted = require('debug')('ssl:certificate:trust')
const {
  key, cert, address, trustCert
} = require('./options')

const save = ({ certificate, clientKey, authority }) => {
  const dir = require('path').dirname(key)
  try {
    fs.mkdirSync(dir)
  } catch(e) {}

  fs.writeFileSync(key, clientKey)
  generated(key)
  fs.writeFileSync(cert, certificate)
  generated(cert)
  Object.keys(authority).forEach(name => {
    fs.writeFileSync(`${dir}/ca.${name}.pem`, authority[name])
    generated(`${dir}/ca.${name}.pem`)
  })
}

const trust = () => new Promise((resolve) => {
  if (!trustCert) return resolve()
  require('child_process').execSync(
    `certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n ${cert} -i ${cert}`
  )
  trusted(cert)
})
  .then(() => process.exit())

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
    }, (e2, {certificate, clientKey}) => {
      if (e2) return reject(e2)
      resolve({certificate, clientKey, authority})
    })
  })
)
  .then(save)
  .then(trust)
  .catch(error)



module.exports = {generate, trust}
