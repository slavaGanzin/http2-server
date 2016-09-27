const opn         = require('opn')
const errorOpn    = require('debug')('http2:error:opn')

const {
  open, URL
} = require('./options')

module.exports = () => {
  if (! open) return
  
  const app = typeof open == 'string'
    ? open.match(/(\w+|-+\w+)/g) : null
  
  opn(URL, { app })
  .catch(error => errorOpn(error.toString().replace('ENOENT','')))
}
