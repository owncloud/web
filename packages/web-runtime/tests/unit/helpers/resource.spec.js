import { getResourceSize } from 'web-runtime/src/helpers/resource'

describe('getResourceSize', () => {
  it.each`
    size          | result
    ${0}          | ${'0 B'}
    ${1023}       | ${'1 kB'}
    ${1024}       | ${'1 kB'}
    ${1287654323} | ${'1.3 GB'}
    ${-1}         | ${'0 B'}
    ${'string'}   | ${'?'}
  `('converts the size integer to human readable format', ({ size, result }) => {
    expect(getResourceSize(size)).toEqual(result)
  })
})
