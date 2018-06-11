require('nightwatch-cucumber')({
  /* other configuration options */
			cucumberArgs : [
					'--require', 'tests/acceptance/stepDefinitions', '--format',
					'node_modules/cucumber-pretty', '--format',
					'json:reports/cucumber.json', 'tests/acceptance/features'
					]
})

module.exports = (function(settings) {
  return settings;
})(require('./nightwatch.json'));

