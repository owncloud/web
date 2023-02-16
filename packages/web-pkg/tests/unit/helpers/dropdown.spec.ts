import { displayPositionedDropdown, getPopperOptions } from '../../../src/helpers'

describe('displayPositionedDropdown', () => {
  it('shows the dropdown', () => {
    const dropdown = { setProps: jest.fn(), show: jest.fn() }
    const ctxMenuBtn = { $el: { getBoundingClientRect: jest.fn() } }
    displayPositionedDropdown(dropdown, undefined, ctxMenuBtn)
    expect(dropdown.show).toHaveBeenCalled()
  })
  it('horizontally positions the drop at the cursor for "contextmenu"-event', () => {
    const event = { type: 'contextmenu', clientX: 100 }
    let dropdownProps
    const dropdown = {
      setProps: jest.fn((props) => {
        dropdownProps = props
      }),
      show: jest.fn()
    }
    const ctxMenuBtn = { $el: { getBoundingClientRect: jest.fn(() => ({})) } }
    displayPositionedDropdown(dropdown, event, ctxMenuBtn)
    const data = dropdownProps.getReferenceClientRect()
    expect(data.left).toEqual(event.clientX)
    expect(data.right).toEqual(event.clientX)
  })
  it('horizontally positions the drop at context menu button if no "contextmenu"-event given', () => {
    const event = { clientX: 100 }
    let dropdownProps
    const dropdown = {
      setProps: jest.fn((props) => {
        dropdownProps = props
      }),
      show: jest.fn()
    }
    const ctxMenuBtnX = 200
    const ctxMenuBtn = { $el: { getBoundingClientRect: jest.fn(() => ({ x: ctxMenuBtnX })) } }
    displayPositionedDropdown(dropdown, event, ctxMenuBtn)
    const data = dropdownProps.getReferenceClientRect()
    expect(data.left).toEqual(ctxMenuBtnX)
    expect(data.right).toEqual(ctxMenuBtnX)
  })
})

describe('getPopperOptions', () => {
  it.each(['maxSize', 'fixVerticalPosition'])('modifier "%s" is present', (modifier) => {
    const popperOptions = getPopperOptions()
    expect(popperOptions.modifiers.find((m) => m.name === modifier)).toBeTruthy()
  })
  describe('"fixVerticalPosition" modifier', () => {
    const getStateMock = ({ dropHeight, dropTriggerYPos }) => ({
      modifiersData: { fullHeight: dropHeight },
      elements: { reference: { getBoundingClientRect: () => ({ top: dropTriggerYPos }) } },
      styles: { popper: {} }
    })

    it('vertical position does not need fixing if enough screen space available', () => {
      const windowHeight = 1000
      const dropHeight = 100
      const dropTriggerYPos = 0
      const popperOptions = getPopperOptions()
      const modifier = popperOptions.modifiers.find((m) => m.name === 'fixVerticalPosition')

      ;(window as any).innerHeight = windowHeight
      const state = getStateMock({ dropHeight, dropTriggerYPos })
      modifier.fn({ state } as any)

      expect(state.styles.popper).toEqual({})
    })
    it('vertical position needs fixing if above and below is not enough screen space', () => {
      const windowHeight = 150
      const dropHeight = 100
      const dropTriggerYPos = 75
      const popperOptions = getPopperOptions()
      const modifier = popperOptions.modifiers.find((m) => m.name === 'fixVerticalPosition')

      ;(window as any).innerHeight = windowHeight
      const state = getStateMock({ dropHeight, dropTriggerYPos })
      modifier.fn({ state } as any)

      expect(state.styles.popper).toEqual({ top: `-${dropTriggerYPos}px` })
    })
    it('adds overflow and maxHeight when the available space is smaller than the drop', () => {
      const windowHeight = 50
      const dropHeight = 100
      const dropTriggerYPos = 0
      const popperOptions = getPopperOptions()
      const modifier = popperOptions.modifiers.find((m) => m.name === 'fixVerticalPosition')

      ;(window as any).innerHeight = windowHeight
      const state = getStateMock({ dropHeight, dropTriggerYPos })
      modifier.fn({ state } as any)

      expect(state.styles.popper).toEqual({
        top: `-${dropTriggerYPos}px`,
        maxHeight: `${windowHeight - 10}px`,
        overflowX: 'hidden',
        overflowY: 'auto'
      })
    })
  })
})
