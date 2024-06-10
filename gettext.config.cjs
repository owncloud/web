module.exports = {
  input: {
    path: './src',
    include: ['**/*.js', '**/*.ts', '**/*.vue']
  },
  output: {
    locales: ['bg', 'cs', 'de', 'es', 'fr', 'it', 'nl', 'ko', 'ru', 'sq', 'sv', 'tr', 'zh'],
    path: './l10n/locale',
    potPath: '../template.pot',
    jsonPath: "../translations.json",
    flat: false,
    linguas: false
  }
}
