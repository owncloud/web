import { useFileActionsCreateNewFile } from 'web-app-files/src/composables'

describe('useFileActionsCreateNewFile', () => {
  describe('checkNewFileName', () => {
    it('returns error message if file name is empty', () => {
      const { checkNewFileName } = useFileActionsCreateNewFile()

      const result = checkNewFileName('')

      expect(result).toBe('File name cannot be empty')
    })

    it('returns error message if file name contains "/"', () => {
      const { checkNewFileName } = useFileActionsCreateNewFile()

      const result = checkNewFileName('file/name')

      expect(result).toBe('File name cannot contain "/"')
    })

    it('returns error message if file name is equal to "."', () => {
      const { checkNewFileName } = useFileActionsCreateNewFile()

      const result = checkNewFileName('.')

      expect(result).toBe('File name cannot be equal to "."')
    })

    it('returns error message if file name is equal to ".."', () => {
      const { checkNewFileName } = useFileActionsCreateNewFile()

      const result = checkNewFileName('..')

      expect(result).toBe('File name cannot be equal to ".."')
    })

    it('returns error message if file name ends with whitespace', () => {
      const { checkNewFileName } = useFileActionsCreateNewFile()

      const result = checkNewFileName('file name ')

      expect(result).toBe('File name cannot end with whitespace')
    })
  })
})
