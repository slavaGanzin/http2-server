const inquirer   = require('inquirer')
const R          = require('ramda')
const Yadda      = require('yadda')
const {execSync} = require('child_process')
const testPath   = './tests/features/'

const testFiles  = R.map(
  R.compose(R.objOf('name'), R.replace(/(.*\/|\.feature)/g, ''), String)
, new Yadda.FeatureFileSearch(testPath).list())

const {all, tests} = require('commander')
  .option('-a, --all', 'all options')
  .option('-t, --tests [1,2,3,...]', 'run tests number', [],
    R.compose(R.map(parseInt), R.split(/,\s?/)))
  .parse(process.argv)

let run = () =>
  inquirer.prompt([{
    type: 'checkbox',
    message: 'Select tests',
    name: 'tests',
    default: [],
    choices: testFiles
  }])
      
if (!R.isEmpty(tests))
  run = () => Promise.resolve({ tests: R.pluck('name', R.pick(tests, testFiles)) })

if (all)
  run = () => Promise.resolve({ tests: R.pluck('name', testFiles) })
    

run()
  .then(R.evolve({'tests': R.map(x=>`${testPath}${x}.feature`)}))
  .then(({tests}) => `./node_modules/.bin/mocha --timeout 10000 --tests='${JSON.stringify(tests)}' --reporter spec tests/all.js `)
  .then(x => execSync(x, {stdio:[0,1,2]}))
  .catch(() => process.exit(1))
