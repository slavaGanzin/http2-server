const opn         = require('opn')
const errorOpn    = require('debug')('http2:error:opn')

const {
  open, protocol, address, port
} = require('./options')

module.exports = () => {
  if (! open) return
  
  const app = typeof open == 'string'
    ? open.match(/(\w+|-+\w+)/g) : null
  
  opn(`${protocol}://${address}:${port}`, { app })
  .catch(error => errorOpn(error.toString().replace('ENOENT','')))
}
