import { providerStore } from '../../../src/service'

const dummyProviderOne = {
  id: 'id',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn()
}

const dummyProviderTwo = { ...dummyProviderOne, available: false }

beforeEach(() => (providerStore.providers = []))

describe('providerStore service', () => {
  test('new providers can be added to the store', () => {
    providerStore.addProvider(dummyProviderOne)
    providerStore.addProvider(dummyProviderTwo)
    expect(providerStore.providers.length).toBe(2)
  })
  test('only available providers can be requested', () => {
    providerStore.addProvider(dummyProviderOne)
    providerStore.addProvider(dummyProviderTwo)
    expect(providerStore.availableProviders.length).toBe(1)
  })
})
