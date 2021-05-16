module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        shippedProposals: true,
        corejs: {
          version: 3,
          proposals: true
        }
      }
    ]
  ],
  env: {
    test: {
      plugins: ['istanbul']
    }
  }
}
