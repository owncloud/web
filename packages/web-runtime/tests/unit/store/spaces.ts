import module from '../../../src/store/spaces'
import { cloneDeep } from 'lodash-es'

const { mutations } = module

const stateFixture = {
  spaces: [
    {
      id: 1,
      name: 'personal',
      driveType: 'personal'
    },
    {
      id: 2,
      name: 'My space',
      driveType: 'project'
    }
  ]
}
let stateMock: typeof stateFixture
const resetState = () => {
  stateMock = cloneDeep(stateFixture)
}

describe('vuex store mutations', () => {
  describe('space store', () => {
    beforeEach(resetState)
    describe('method "UPSERT_SPACE"', () => {
      it('Adds the space to the store', () => {
        const upsertSpace = { id: 3, name: 'New space', driveType: 'project' }
        mutations.UPSERT_SPACE(stateMock, upsertSpace)
        expect(stateMock.spaces.some((sM) => sM.id === upsertSpace.id)).toBeTruthy()
      })
    })
    describe('method "CLEAR_SPACES"', () => {
      it('Sets space store to an empty array', () => {
        mutations.CLEAR_SPACES(stateMock)
        expect(stateMock.spaces).toEqual([])
      })
    })
    describe('method "REMOVE_SPACE"', () => {
      it('Removes the space from the store', () => {
        mutations.REMOVE_SPACE(
          stateMock,
          stateMock.spaces.find((sM) => sM.id === 1)
        )
        expect(stateMock.spaces.every((sM) => sM.id !== 1)).toBeTruthy()
      })
    })
    describe('method "UPDATE_SPACE_FIELD"', () => {
      it('Updates the space in the store', () => {
        mutations.UPDATE_SPACE_FIELD(stateMock, {
          id: 2,
          field: 'name',
          value: 'Renamed space'
        })
        expect(stateMock.spaces.some((sM) => sM.name === 'Renamed space')).toBeTruthy()
      })
    })
  })
})
