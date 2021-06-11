import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import StoreFiles from '../../../src/store'
import Store from '@runtime/src/store'

import Personal from '../../../src/views/Personal.vue'

const routes = [
  { name: 'files-personal', path: '/files/list/personal/:item?/:page?', component: Personal }
]
const store = {
  ...Store,
  modules: {
    ...Store.modules,
    Files: StoreFiles
  },
}

describe('User can navigate in files list using pagination', () => {
  beforeEach(() => {
    const appBar = document.createElement('div')
    appBar.id = 'files-app-bar'

    document.body.appendChild(appBar)
  })

  afterEach(() => {
    fetch.resetMocks()
  })

  test('Resources get updated when user navigates to a new page via pagination', () => {
    const { getByTestId, debug, baseElement } = render(Personal, { routes, store })

    debug(baseElement)

    expect(getByTestId('test')).toBeVisible()
  })

  test.todo('Resources get updated when user navigates to a new page directly via URL')
})
