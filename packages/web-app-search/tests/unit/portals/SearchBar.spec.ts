import { Wrapper, mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import SearchBar from '../../../src/portals/SearchBar.vue'
import AsyncComputed from 'vue-async-computed'
import merge from 'lodash-es/merge'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(AsyncComputed)

let wrapper: Wrapper<any>

const dummyProviderOne = {
  id: 'dummy.one',
  label: 'dummy.one.label',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn(),
  previewSearch: {
    available: true,
    search: jest.fn(),
    activate: jest.fn()
  }
}

const dummyProviderTwo = {
  id: 'dummy.two',
  label: 'dummy.two.label',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn()
}

const searchEventOptions = {
  path: [{ id: 'files-global-search-bar' }]
}

beforeEach(() => {
  jest.resetAllMocks()
})

afterEach(() => {
  wrapper.destroy()
})

describe('Search Bar portal component', () => {
  test('does not render a search field if not all requirements are fulfilled', () => {
    wrapper = mount(SearchBar, { localVue })
    expect(wrapper.element.innerHTML).toBeFalsy()
  })
  test('updates the search term on input', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.vm.$data.term).toBe('old')
    await wrapper.find('input').setValue('new')
    expect(wrapper.vm.$data.term).toBe('new')
  })
  test('the active provider get reset on route change', () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          activeProvider: { available: false }
        }
      },
      mocks: {
        $route: {
          name: 'old'
        }
      }
    })

    expect(wrapper.vm.$data.activeProvider).toBeTruthy()
    ;(wrapper.vm.$options.watch.$route as any).call(wrapper.vm)
    expect(wrapper.vm.$data.activeProvider).toBeFalsy()
  })
  test('notifies active provider to update term on input', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.find('input').setValue('new')
    expect(dummyProviderOne.updateTerm).toBeCalledTimes(1)
    expect(dummyProviderOne.updateTerm).toBeCalledWith('new')
  })
  test('hides options on clear', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.find('#files-global-search-options').exists()).toBeTruthy()
    await wrapper.find('input').setValue('new')
    await wrapper.find('.oc-search-clear').trigger('click')
    expect(wrapper.find('#files-global-search-options').exists()).toBeFalsy()
  })
  test('resets term on clear', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.find('input').setValue('new')
    await wrapper.find('.oc-search-clear').trigger('click')
    expect(wrapper.vm.$data.term).toBeFalsy()
  })
  test('notifies active provider to reset on clear', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.find('input').setValue('new')
    await wrapper.find('.oc-search-clear').trigger('click')
    expect(dummyProviderOne.reset).toBeCalledTimes(1)
  })
  test('hides options if no term given', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.find('#files-global-search-options').exists()).toBeTruthy()
    await wrapper.find('input').setValue('')
    expect(wrapper.find('#files-global-search-options').exists()).toBeFalsy()
  })
  test('shows options only if optionsVisible is true and a search term is given', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: false,
          term: undefined,
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.find('#files-global-search-options').exists()).toBeFalsy()
    await wrapper.setData({ optionsVisible: true })
    expect(wrapper.find('#files-global-search-options').exists()).toBeFalsy()
    await wrapper.setData({ term: 'defined' })
    expect(wrapper.find('#files-global-search-options').exists()).toBeTruthy()
  })
  test('lists all available providers', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.findAll('li.provider').length).toBe(1)
    await wrapper.setData({
      providerStore: {
        availableProviders: [dummyProviderOne, dummyProviderTwo]
      }
    })
    expect(wrapper.findAll('li.provider').length).toBe(2)
  })
  test('marks the active provider as selected', () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderTwo,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const providers = wrapper.findAll('li.provider')
    expect(providers.at(0).classes()).not.toContain('selected')
    expect(providers.at(1).classes()).toContain('selected')
  })
  test('activates the provider by clicking the list item', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const providers = wrapper.findAll('li.provider')
    await providers.at(0).trigger('click')
    expect(dummyProviderOne.activate).toBeCalledTimes(1)
    expect(dummyProviderOne.activate).toBeCalledWith('old')
  })
  test('shows and truncates the search term on providers list item', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const providers = wrapper.findAll('li.provider')
    expect(providers.length).toBe(2)
    await wrapper.find('input').setValue('oldoldoldoldoldoldoldoldoldoldo')
    for (let i = 0; i < providers.length; i++) {
      expect(providers.at(i).get('.term').element.innerHTML).toBe('oldoldoldoldoldoldoldoldold...')
    }
  })
  test('provider label is displayed as tag in  provider list item', () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const providers = wrapper.findAll('li.provider')
    expect(providers.at(0).get('.label').element.innerHTML).toBe(dummyProviderOne.label)
    expect(providers.at(1).get('.label').element.innerHTML).toBe(dummyProviderTwo.label)
  })
  test.todo('shows a loading spinner if the active provider is loading')
  test('shows the preview search result from the active provider only if the provider preview is available', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: merge({}, dummyProviderOne, {
            previewSearch: {
              available: false
            }
          }),
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    await wrapper.find('input').setValue('new')
    expect(dummyProviderOne.previewSearch.search).toBeCalledTimes(0)
  })
  test('shows the preview search result from the active provider', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    dummyProviderOne.previewSearch.search.mockReturnValueOnce([
      { id: 'dummyProviderOne.1', data: 'dummyProviderOne - 1' },
      { id: 'dummyProviderOne.2', data: 'dummyProviderOne - 2' }
    ])
    expect(wrapper.findAll('li.preview').length).toBe(0)
    await wrapper.find('input').setValue('new')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('li.preview').length).toBe(2)
  })
  test('activate a preview by clicking it', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    dummyProviderOne.previewSearch.search.mockReturnValueOnce([
      { id: 'dummyProviderOne.1', data: 'dummyProviderOne - 1' },
      { id: 'dummyProviderOne.2', data: 'dummyProviderOne - 2' }
    ])
    await wrapper.find('input').setValue('new')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('li.preview').at(1).trigger('click')
    expect(dummyProviderOne.previewSearch.activate).toBeCalledTimes(1)
    expect(dummyProviderOne.previewSearch.activate).toBeCalledWith({
      id: 'dummyProviderOne.2',
      data: 'dummyProviderOne - 2'
    })
  })
  test('sets the search term and input term to the route value on mount', () => {
    wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      },
      mocks: {
        $route: {
          query: {
            term: 'routeTerm'
          }
        }
      }
    })

    expect(wrapper.vm.$data.term).toBe('routeTerm')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('routeTerm')
  })
  test("ignores events that don't belong to the SearchBar", async () => {
    wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const options = { path: [] }
    await wrapper.trigger('keyup.a', options)
    expect(wrapper.find('.files-global-search-options').exists()).toBeFalsy()
    await wrapper.trigger('click', options)
    expect(wrapper.find('.files-global-search-options').exists()).toBeFalsy()
    await wrapper.trigger('focusin', options)
    expect(wrapper.find('.files-global-search-options').exists()).toBeFalsy()
  })
  test('providers can be switched by using the arrow up and down keys on keyboard', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    const getClasses = (at: number) => wrapper.findAll('.provider').at(at).element.classList
    await wrapper.trigger('keyup.up', searchEventOptions)
    expect(getClasses(1)).toContain('selected')

    await wrapper.trigger('keyup.up', searchEventOptions)
    expect(getClasses(0)).toContain('selected')

    await wrapper.trigger('keyup.down', searchEventOptions)
    expect(getClasses(1)).toContain('selected')

    await wrapper.trigger('keyup.down', searchEventOptions)
    expect(getClasses(0)).toContain('selected')
  })
  test('hides options on escape key press', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'old',
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    expect(wrapper.vm.$data.optionsVisible).toBeTruthy()
    await wrapper.trigger('keyup.esc', searchEventOptions)
    expect(wrapper.vm.$data.optionsVisible).toBeFalsy()
  })
  test('activate provider on enter key press', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          term: 'old',
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    await wrapper.trigger('click', searchEventOptions)
    await wrapper.find('input').setValue('new')

    const providers = wrapper.findAll('li.provider')
    expect(providers.at(0).classes()).toContain('selected')
    expect(wrapper.vm.$data.optionsVisible).toBeTruthy()
    await wrapper.trigger('keyup.enter', searchEventOptions)
    expect(dummyProviderOne.activate).toBeCalledWith('new')
    expect(dummyProviderOne.activate).toBeCalledTimes(1)
  })
  test('activate provider on click', async () => {
    wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          term: 'old',
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })
    await wrapper.trigger('click', searchEventOptions)
    await wrapper.find('input').setValue('new')

    const providers = wrapper.findAll('li.provider')
    expect(providers.at(0).classes()).toContain('selected')
    expect(wrapper.vm.$data.optionsVisible).toBeTruthy()
    await providers.at(0).trigger('click', searchEventOptions)
    expect(dummyProviderOne.activate).toBeCalledWith('new')
    expect(dummyProviderOne.activate).toBeCalledTimes(1)
  })
})
