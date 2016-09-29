const inquirer   = require('inquirer')
const R          = require('ramda')
const Yadda      = require('yadda')
const {execSync} = require('child_process')
const testPath   = './tests/features/'
const testFiles  = R.map(
  R.compose(R.objOf('name'), R.replace(/(.*\/|\.feature)/g, ''), String)
, new Yadda.FeatureFileSearch(testPath).list())
const {all} = require('minimist')(process.argv.slice(2))


const run = all
? () => Promise.resolve({ tests: R.pluck('name',testFiles) })
: () =>
  inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select tests',
      name: 'tests',
      default: ['01-start'],
      choices: testFiles
    }
  ])

run()
.then(R.evolve({'tests': R.map(x=>`${testPath}${x}.feature`)}))
.then( ({tests}) => `DEBUG=http2*,test*  ./node_modules/.bin/mocha --timeout 10000 --tests='${JSON.stringify(tests)}' --reporter spec tests/all.js `)
.then(x => execSync(x, {stdio:[0,1,2]}));
