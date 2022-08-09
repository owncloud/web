import { extractDomSelector } from '../../../../src/helpers/resource'

describe('extractDomSelector', () => {
  it.each([
    { input: '', expected: '' },
    { input: '1', expected: '1' },
    { input: 'a', expected: 'a' },
    { input: '!=?', expected: '' },
    { input: '-_', expected: '-_' },
    { input: '1a!=?-_', expected: '1a-_' },
    {
      input: 'f2dc18fa-ca05-11ec-8c55-0f9df469d22f',
      expected: 'f2dc18fa-ca05-11ec-8c55-0f9df469d22f'
    }
  ])(
    'creates a string that does not break when being used as query selector',
    ({ input, expected }) => {
      expect(extractDomSelector(input)).toBe(expected)
    }
  )
})
