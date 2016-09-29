const Yadda = require('yadda')
const argv = require('minimist')(process.argv.slice(2))
const R = require('ramda')
const runTest = (file) =>
   featureFile(file, (feature) => {
     const libraries = feature.annotations.library.split(',')
       .map(x => require('./steps/' + x))

     const yadda = Yadda.createInstance(libraries)

     scenarios(feature.scenarios, (scenario) =>
       steps(scenario.steps, (x,y) => yadda.run(x,y) ))
   })

Yadda.plugins.mocha.StepLevelPlugin.init()
R.map(runTest, JSON.parse(argv.tests))
