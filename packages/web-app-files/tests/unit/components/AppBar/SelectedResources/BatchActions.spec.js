import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
const permissionsHelper = '../../../../../src/helpers/permissions'

jest.mock(permissionsHelper, () => ({
  ...jest.requireActual(permissionsHelper),
  canBeMoved: jest.fn(() => false)
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

describe('Batch Actions component', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it.todo('renders an empty list if there are no batch actions available')
  it.todo('renders a button for each available batch action')
})
