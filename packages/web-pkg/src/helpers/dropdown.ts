import maxSize from 'popper-max-size-modifier'

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

export const getPopperOptions = ({ topOffset = 0 } = {}) => ({
  modifiers: [
    maxSize,
    {
      name: 'fixVerticalPosition',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['maxSize'],
      fn({ state }) {
        const dropHeight = state.modifiersData.fullHeight || state.elements.popper.offsetHeight
        const dropYPos = state.elements.reference.getBoundingClientRect().top - topOffset
        const availableHeight = window.innerHeight - topOffset
        const spaceBelow = availableHeight - dropYPos
        const spaceAbove = availableHeight - spaceBelow

        if (dropHeight > spaceBelow && dropHeight > spaceAbove) {
          // place drop on top of screen because of limited screen estate above and below
          state.styles.popper.top = `-${dropYPos}px`
          state.modifiersData.fullHeight = dropHeight
        }

        if (dropHeight > availableHeight) {
          // drop is bigger than total available height
          state.styles.popper.maxHeight = `${availableHeight - 10}px`
          state.styles.popper.overflowY = `auto`
          state.styles.popper.overflowX = `hidden`
        }
      }
    }
  ]
})

export const getTopBarOffset = () => document.getElementById('oc-topbar')?.offsetHeight || 0
export const getSidebarOffset = () => {
  const panelHeader =
    (document.getElementsByClassName('sidebar-panel__header')[0] as HTMLElement) ?? null
  const panelHeaderOffset = panelHeader?.offsetHeight || 0
  const panelFileInfo =
    (document.getElementsByClassName('sidebar-panel__file_info')[0] as HTMLElement) ?? null
  const panelFileInfoOffset = panelFileInfo?.offsetHeight || 0

  return panelHeaderOffset + panelFileInfoOffset + getTopBarOffset()
}
