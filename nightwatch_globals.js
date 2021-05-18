const coverageReporter = {}

module.exports = {
  coverageReporter // this needs to be added to your globals so that the custom command can access it
  // and to set it in the `test_settings` part of the config does not work correctly
}
