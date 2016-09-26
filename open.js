const opn         = require('opn')
const debug       = require('debug')

module.exports = ({open, protocol, address, port}) => {
  if (process.argv.indexOf('-o') > 1) {
    opn(`${protocol}://${address}:${port}`, {
      app: open.split(/\s-+/),
    })
    .catch(error => debug('http2:error:opn')
      (error.toString().replace('ENOENT','')))
  }
}
