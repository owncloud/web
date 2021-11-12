import { accentuateItem } from '../../../../src/helpers/ui/filesList'

describe('accentuateItem', () => {
  it('highlights given data-item-id', () => {
    jest.useFakeTimers()
    document.body.innerHTML =
      '<table><tbody><tr data-item-id="1"><td>1</td></tr><tr data-item-id="2"><td>2</td></tr></tbody></table>'
    const trs = document.getElementsByTagName('tr')

    accentuateItem('1', 50)
    expect(trs[0].classList.contains('oc-table-accentuated')).toBe(true)
    expect(trs[1].classList.contains('oc-table-accentuated')).toBe(false)

    jest.advanceTimersByTime(100)
    expect(trs[0].classList.contains('oc-table-accentuated')).toBe(false)
    expect(trs[1].classList.contains('oc-table-accentuated')).toBe(false)

    accentuateItem('2', 50)
    expect(trs[0].classList.contains('oc-table-accentuated')).toBe(false)
    expect(trs[1].classList.contains('oc-table-accentuated')).toBe(true)

    // do not fail in setTimeout if element went away
    trs[1].remove()
    jest.advanceTimersByTime(100)
  })
})
