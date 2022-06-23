module.exports = {
  src_folders: ['./stepDefinitions'],
  test_runner: {
    type: 'cucumber',
    options: {
      feature_path: './features/**/*.feature'
    }
  }
}
