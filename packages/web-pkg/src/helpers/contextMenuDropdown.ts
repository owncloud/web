export const displayPositionedDropdown = (dropdown, event, contextMenuButton) => {
  console.log("HENLO I'M NOT MOCKED")
  const contextMenuButtonPos = contextMenuButton.$el.getBoundingClientRect()
  const isKeyboardEvent = event.clientY === 0
  const yValue = isKeyboardEvent
    ? event.srcElement?.getBoundingClientRect().top || 0
    : event.clientY

  dropdown.setProps({
    getReferenceClientRect: () => ({
      width: 0,
      height: 0,
      top: yValue,
      bottom: yValue,
      /**
       * If event type is 'contextmenu' the trigger was a right click on the table row,
       * so we render the dropdown at the position of the mouse pointer.
       * Otherwise we render the dropdown at the position of the three-dot-menu
       */
      left: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x,
      right: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x
    })
  })

  dropdown.show()
}
