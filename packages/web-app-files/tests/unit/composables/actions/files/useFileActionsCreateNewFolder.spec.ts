import { useFileActionsCreateNewFolder } from 'web-app-files/src/composables'

describe('useFileActionsCreateNewFolder', () => {
  describe('checkNewFileName', () => {
    it('returns error message if file name is empty', () => {
      const { checkNewFolderName } = useFileActionsCreateNewFolder()

      const result = checkNewFolderName('')

      expect(result).toBe('File name cannot be empty')
    })

    it('returns error message if file name contains "/"', () => {
      const { checkNewFolderName } = useFileActionsCreateNewFolder()

      const result = checkNewFolderName('file/name')

      expect(result).toBe('File name cannot contain "/"')
    })

    it('returns error message if file name is equal to "."', () => {
      const { checkNewFolderName } = useFileActionsCreateNewFolder()

      const result = checkNewFolderName('.')

      expect(result).toBe('File name cannot be equal to "."')
    })

    it('returns error message if file name is equal to ".."', () => {
      const { checkNewFolderName } = useFileActionsCreateNewFolder()

      const result = checkNewFolderName('..')

      expect(result).toBe('File name cannot be equal to ".."')
    })

    it('returns error message if file name ends with whitespace', () => {
      const { checkNewFolderName } = useFileActionsCreateNewFolder()

      const result = checkNewFolderName('file name ')

      expect(result).toBe('File name cannot end with whitespace')
    })
  })
})
