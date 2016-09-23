const fs = require('fs')
const readme = 'README.md'
require('./options')
.outputHelp(text => {
  text = [
    "#Usage","\n```\n",
    text.replace(/\s+Usage: updateReadme/,'http-server'),
    "```",'',"#Allow"
  ].join("\n")
  
  fs.writeFileSync(readme,
    String(fs.readFileSync(readme, 'utf8'))
    .replace(/#Usage(.*\n)+#Allow/gim,
      text)
  )
  return ''
})
