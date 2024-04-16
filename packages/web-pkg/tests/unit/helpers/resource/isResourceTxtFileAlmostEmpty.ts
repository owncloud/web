import { Resource } from '@ownclouders/web-client'
import { isResourceTxtFileAlmostEmpty } from '../../../../src/helpers/resource'

describe('isResourceTxtFileAlmostEmpty', () => {
  it('return true for resources smaller 30 bytes', () => {
    expect(isResourceTxtFileAlmostEmpty({ mimeType: 'text/plain', size: 20 } as Resource)).toBe(
      true
    )
  })
  it('return false for resources larger 30 bytes', () => {
    expect(isResourceTxtFileAlmostEmpty({ mimeType: 'text/plain', size: 35 } as Resource)).toBe(
      false
    )
  })
  it('return false for resources that are not text', () => {
    expect(
      isResourceTxtFileAlmostEmpty({ mimeType: 'application/json', size: 35 } as Resource)
    ).toBe(false)
  })
  it('return false for resources that have undefined mimeType', () => {
    expect(isResourceTxtFileAlmostEmpty({ mimeType: undefined, size: 35 } as Resource)).toBe(false)
  })
})
