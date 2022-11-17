const { sortProps } = require('./utils')
const reportColorContrast = require('./format-report-color-contrast')

module.exports = ({ data, dictionary }) => {
  if (dictionary.file.report?.colorContrast) {
    sortProps(dictionary.allProperties).forEach(reportColorContrast)
  }

  return data
}
