import getters from 'web-app-files/src/store/getters'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'

let state
const mockedFiles = [mockDeep<Resource>(), mockDeep<Resource>(), mockDeep<Resource>()]
describe('Getters', () => {
  beforeEach(() => {
    state = {
      files: mockedFiles,
      searchTermGlobal: '',
      areHiddenFilesShown: true
    }
  })

  describe('activeFiles', () => {
    const cases = [
      ['contains', true],
      ['hides', false]
    ]

    it.each(cases)('%s hidden files if areHiddenFilesShown is set to %s', (value) => {
      state.areHiddenFilesShown = value

      const { activeFiles, filesAll } = getters
      const result = activeFiles(state, { filesAll: filesAll(state) })

      expect(result.length).toEqual(mockedFiles.length)
    })
  })
})
