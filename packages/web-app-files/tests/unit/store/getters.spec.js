import getters from '@files/src/store/getters'
import FixtureFiles from '@/__fixtures__/files'

let state

describe('Getters', () => {
  beforeEach(() => {
    state = {
      files: FixtureFiles['/'],
      searchTermGlobal: '',
      filesPageLimit: 10,
      filesSearched: [],
      areHiddenFilesShown: true
    }
  })

  describe('activeFiles', () => {
    const cases = [
      ['contains', true],
      ['hides', false]
    ]

    it.each(cases)('%s hidden files if areHiddenFilesShown is set to %s', value => {
      state.areHiddenFilesShown = value

      const { activeFiles, filesAll } = getters
      const result = activeFiles(state, { filesAll: filesAll(state) })

      expect(result.length).toEqual(5)
    })

    it('returns only a portion of files if files page limit is set', () => {
      state.filesPageLimit = 2

      const { activeFiles, filesAll } = getters
      const result = activeFiles(state, { filesAll: filesAll(state) })

      expect(result.length).toEqual(2)
    })

    it('returns all files if files page limit is of type string', () => {
      state.filesPageLimit = 'All'

      const { activeFiles, filesAll } = getters
      const result = activeFiles(state, { filesAll: filesAll(state) })

      expect(result.length).toEqual(5)
    })
  })
})
