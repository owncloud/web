import { canBeMoved } from '@files/src/helpers/permissions.js'

describe('permissions helper', () => {
  describe('canBeMoved function', () => {
    it.each([
      { isReceivedShare: false, isMounted: false, canBeDeleted: true, parentPath: '' },
      { isReceivedShare: false, isMounted: false, canBeDeleted: true, parentPath: 'folder' },
      { isReceivedShare: true, isMounted: false, canBeDeleted: true, parentPath: 'folder' },
      { isReceivedShare: false, isMounted: true, canBeDeleted: true, parentPath: 'folder' }
    ])(
      'should return true if the given resource can be deleted and if it is not mounted in root',
      (input) => {
        // resources are supposed to be external if it is a received share or is mounted
        // resources are supposed to be mountedInRoot if its parentPath is an empty string and resource is external
        expect(
          canBeMoved(
            {
              isReceivedShare: () => input.isReceivedShare,
              isMounted: () => input.isMounted,
              canBeDeleted: () => input.canBeDeleted
            },
            input.parentPath
          )
        ).toBeTruthy()
      }
    )
    it.each([
      { isReceivedShare: false, isMounted: false, canBeDeleted: false, parentPath: '' },
      { isReceivedShare: false, isMounted: false, canBeDeleted: false, parentPath: 'folder' },
      { isReceivedShare: true, isMounted: false, canBeDeleted: false, parentPath: 'folder' },
      { isReceivedShare: false, isMounted: true, canBeDeleted: false, parentPath: 'folder' },
      { isReceivedShare: false, isMounted: true, canBeDeleted: true, parentPath: '' },
      { isReceivedShare: true, isMounted: false, canBeDeleted: true, parentPath: '' },
      { isReceivedShare: true, isMounted: true, canBeDeleted: true, parentPath: '' }
    ])(
      'should return false if the given resource cannot be deleted or if it is mounted in root',
      (input) => {
        expect(
          canBeMoved(
            {
              isReceivedShare: () => input.isReceivedShare,
              isMounted: () => input.isMounted,
              canBeDeleted: () => input.canBeDeleted
            },
            input.parentPath
          )
        ).toBeFalsy()
      }
    )
  })
})
