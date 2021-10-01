import getters from '@files/src/store/getters'
import FixtureFiles from '@/__fixtures__/files'

let state
let rootState
describe('Getters', () => {
  beforeEach(() => {
    state = {
      files: FixtureFiles['/'],
      searchTermGlobal: '',
      areHiddenFilesShown: true
    }
    rootState = {
      Files: {
        pagination: {
          currentPage: 1,
          itemsPerPage: 10
        }
      }
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
      const result = activeFiles(state, { filesAll: filesAll(state) }, rootState)

      expect(result.length).toEqual(5)
    })
  })

  describe('activeFilesCurrentPage', () => {
    it('returns only a portion of files if files page limit is set', () => {
      rootState.Files.pagination.itemsPerPage = 2

      const { activeFilesCurrentPage, activeFiles, filesAll } = getters
      const result = activeFilesCurrentPage(
        state,
        { activeFiles: activeFiles(state, { filesAll: filesAll(state) }) },
        rootState
      )

      expect(result.length).toEqual(2)
    })

    it('returns all files if files page limit is of type string', () => {
      rootState.Files.pagination.itemsPerPage = 'All'

      const { activeFilesCurrentPage, activeFiles, filesAll } = getters
      const result = activeFilesCurrentPage(
        state,
        { activeFiles: activeFiles(state, { filesAll: filesAll(state) }) },
        rootState
      )

      expect(result.length).toEqual(5)
    })
  })
})
