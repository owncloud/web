export const displayPositionedDropdown = (dropdown, event, contextMenuButton) => {
  const contextMenuButtonPos = contextMenuButton.$el.getBoundingClientRect()
  dropdown.setProps({
    getReferenceClientRect: () => ({
      width: 0,
      height: 0,
      top: event.clientY,
      bottom: event.clientY,
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
