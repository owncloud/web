const { createCoverageReporter } = require('nightwatch-coverage')

const coverageReporter = createCoverageReporter({
  /* options */
})

module.exports = {
  coverageReporter, // this needs to be added to your globals so that the custom command can access it
  after(done) {
    coverageReporter.save() // call this function in your global after hook
    done()
  },
  afterEach(browser, done) {
    // this will not work if you call `client.end` in your test
    browser.collectCoverage(function() {
      // eslint-disable-next-line no-undef
      client.end(done)
    })
  }
}
