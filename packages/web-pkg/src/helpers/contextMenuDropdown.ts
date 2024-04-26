import OcButton from 'design-system/src/components/OcButton/OcButton.vue'
import OcDrop from 'design-system/src/components/OcDrop/OcDrop.vue'
import { ComponentPublicInstance } from 'vue'

export type ContextMenuBtnClickEventData = {
  event: MouseEvent
  dropdown: ComponentPublicInstance<typeof OcDrop>
}

export const displayPositionedDropdown = (
  dropdown: ComponentPublicInstance<typeof OcDrop>,
  event: MouseEvent,
  contextMenuButton: ComponentPublicInstance<typeof OcButton>
) => {
  const contextMenuButtonPos = contextMenuButton.$el.getBoundingClientRect()
  const isKeyboardEvent = event.clientY === 0
  const yValue = isKeyboardEvent
    ? (event.target as HTMLElement)?.getBoundingClientRect().top || 0
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
