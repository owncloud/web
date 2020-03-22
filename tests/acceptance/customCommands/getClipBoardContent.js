exports.command = function(callback) {
  const helperElementId = 'helperClipboardInput'
  this.execute(
    function(elementId) {
      const myInput = document.createElement('INPUT')
      const inputId = document.createAttribute('id')
      inputId.value = elementId
      myInput.setAttributeNode(inputId)
      myInput.setAttribute('style', 'position: absolute; left:0; top:0;') // make sure its visible
      document.body.appendChild(myInput)
    },
    [helperElementId]
  )
    .useCss()
    .setValue(`#${helperElementId}`, '') // just to focus the element
    .keys([this.Keys.CONTROL, 'v']) // copy the content of the clipboard into that field
    .getValue(`#${helperElementId}`, function(clipboard) {
      callback(clipboard.value)
    })
    .execute(
      function(elementId) {
        const el = document.getElementById(elementId)
        el.parentNode.removeChild(el)
      },
      [helperElementId]
    )

  return this
}
