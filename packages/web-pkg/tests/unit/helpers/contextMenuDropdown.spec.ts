import { displayPositionedDropdown } from '../../../src/helpers'

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
