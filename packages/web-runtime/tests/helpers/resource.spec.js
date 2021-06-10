import { getResourceSize } from 'web-runtime/src/helpers/resource'

describe('getResourceSize', () => {
  it.each`
    size          | result
    ${0}          | ${'0 B'}
    ${1023}       | ${'1023 B'}
    ${1024}       | ${'1 KB'}
    ${1287654323} | ${'1.2 GB'}
    ${-1}         | ${'0 B'}
    ${'string'}   | ${'?'}
  `('converts the size integer to human readable format', ({ size, result }) => {
    expect(getResourceSize(size)).toEqual(result)
  })
})
