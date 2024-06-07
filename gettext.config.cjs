module.exports = {
  input: {
    path: './src',
    include: ['**/*.js', '**/*.ts', '**/*.vue']
  },
  output: {
    locales: ['bg', 'cs', 'de', 'en', 'es', 'fr', 'it', 'nl', 'ko', 'ru', 'sq', 'sv', 'tr', 'zh'],
    path: './l10n/locale',
    potPath: '../template.pot',
    flat: false,
    linguas: false
  }
}
