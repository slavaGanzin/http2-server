const fs = require('fs')
const readme = 'README.md'
require('../options')
.outputHelp(text => {
  text = [
    "#Usage","\n```\n",
    text.replace(/\s+Usage: updateReadme/,'http2-server'),
    "```",'',"#Usage"
  ].join("\n")
  
  fs.writeFileSync(readme,
    String(fs.readFileSync(readme, 'utf8'))
    .replace(/#Usage(.*\n)+#Usage/gim,
      text)
  )
  return ''
})
