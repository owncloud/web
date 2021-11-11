import { accentuateItem } from '../../../../src/helpers/ui/filesList'
describe('filesList', () => {
  it('accentuateItem', () => {
    jest.useFakeTimers()
    document.body.innerHTML =
      '<table><tbody><tr data-item-id="1"><td>1</td><td data-item-id="2">2</td></tr></tbody></table>'
    accentuateItem('1', 50)
    expect(document.getElementsByClassName('oc-table-accentuated').length).toBe(1)
    jest.advanceTimersByTime(100)
    expect(document.getElementsByClassName('oc-table-accentuated').length).toBe(0)
  })
})
