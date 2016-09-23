const fs = require('fs')
const readme = 'README.md'
require('./options')
.outputHelp(text => {
  text = ["#Usage","```",text,"```","#Allow"].join("\n")
  fs.writeFileSync(readme,
    String(fs.readFileSync(readme, 'utf8'))
    .replace(/#Usage(.*\n)+#Allow/gim,
      text.replace(/\s+Usage: updateReadme/,'http-server'))
  )
  return ''
})
