import { isSameResource } from '../../../../src/helpers/resource'

describe('isSameResource', () => {
  test('evaluates to false if one of the resources is nullish', () => {
    expect(isSameResource(null, null)).toBe(false)
    expect(isSameResource(undefined, undefined)).toBe(false)
    expect(isSameResource(null, { id: 1, path: '', webDavPath: '' })).toBe(false)
    expect(isSameResource(undefined, { id: 1, path: '', webDavPath: '' })).toBe(false)
    expect(isSameResource({ id: 1, path: '', webDavPath: '' }, null)).toBe(false)
    expect(isSameResource({ id: 1, path: '', webDavPath: '' }, undefined)).toBe(false)
  })
  test('evaluates to false if ids are of different types', () => {
    expect(
      isSameResource({ id: 1, path: '', webDavPath: '' }, { id: '1', path: '', webDavPath: '' })
    ).toBe(false)
  })
  test('evaluates to false if ids are different values', () => {
    expect(
      isSameResource({ id: 1, path: '', webDavPath: '' }, { id: 2, path: '', webDavPath: '' })
    ).toBe(false)
    expect(
      isSameResource({ id: '1', path: '', webDavPath: '' }, { id: '2', path: '', webDavPath: '' })
    ).toBe(false)
  })
  test('evaluates to true if ids are the same', () => {
    expect(
      isSameResource({ id: 1, path: '', webDavPath: '' }, { id: 1, path: '', webDavPath: '' })
    ).toBe(true)
    expect(
      isSameResource({ id: '1', path: '', webDavPath: '' }, { id: '1', path: '', webDavPath: '' })
    ).toBe(true)
  })
})
