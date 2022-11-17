const { checkContrast, getPropType } = require('./utils')
const chalk = require('chalk')
const util = require('util')

module.exports = (prop) => {
  if (getPropType(prop) !== 'color' || !prop.check?.contrast) {
    return
  }
  const reports = []

  ;[...(Array.isArray(prop.check.contrast) ? prop.check.contrast : [prop.check.contrast])].forEach(
    (contrast) => {
      ;[
        ...(Array.isArray(contrast.background) ? contrast.background : [contrast.background])
      ].forEach((background) => {
        reports.push(
          checkContrast({
            givenColor: prop.value,
            givenBackground: background,
            ratio: contrast.ratio
          })
        )
      })
    }
  )

  if (reports.every((report) => report.givenRatio.valid)) {
    return
  }

  const printer = [chalk.red(util.format(`✗  %s`, chalk.bold(prop.name)))]
  reports.forEach((report, i) => {
    printer.push('   ----------------------------------------------------------------------------')
    printer.push(
      util.format(
        `   %s  %s has a contrast ratio of %s on %s`,
        chalk.bold(report.givenRatio.valid ? '✓' : '✗'),
        chalk.bold(
          chalk.hex(report.givenColor.toHexString())(`■ ${report.givenColor.toRgbString()}`)
        ),
        chalk.bold(report.givenRatio.value),
        chalk.bold(
          chalk.hex(report.givenBackground.toHexString())(
            `■ ${report.givenBackground.toRgbString()}`
          )
        )
      )
    )
    printer.push(
      util.format(
        `      %s with a ratio of %s fixes this`,
        chalk.bold(
          chalk.hex(report.recommendedColor.toHexString())(
            `■ ${report.recommendedColor.toRgbString()}`
          )
        ),
        chalk.bold(report.recommendedRatio.value),
        chalk.bold(
          chalk.hex(report.givenBackground.toHexString())(
            `■ ${report.givenBackground.toRgbString()}`
          )
        )
      )
    )
    if (i + 1 === reports.length) {
      printer.push('\n')
    }
  })

  console.log(printer.join('\n'))
}
