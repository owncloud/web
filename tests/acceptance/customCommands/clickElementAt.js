exports.command = function clickElementAt(selector, x, y, mouseButton = 0) {
  return this.moveToElement(selector, x, y).mouseButtonClick(mouseButton)
}
