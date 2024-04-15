import { HttpClient } from '../../../src/http'
import { ClientService, useAuthStore, useClientStore, useConfigStore } from '../../../src/'
import { Language } from 'vue3-gettext'
import { Graph, OCS, client as _client } from '@ownclouders/web-client'
import { createTestingPinia, writable } from 'web-test-helpers'
import axios from 'axios'

const getters = { 'runtime/auth/accessToken': 'token' }
const language = { current: 'en' }
const serverUrl = 'someUrl'

const getClientServiceMock = () => {
  const authStore = useAuthStore()
  const configStore = useConfigStore()
  const clientStore = useClientStore()
  writable(configStore).serverUrl = serverUrl

  return {
    clientService: new ClientService({
      configStore,
      language: language as Language,
      authStore,
      clientStore
    }),
    authStore
  }
}
const v4uuid = '00000000-0000-0000-0000-000000000000'
vi.mock('uuid', () => ({ v4: () => v4uuid }))
vi.mock('@ownclouders/web-client', () => ({ client: vi.fn(() => ({ graph: {}, ocs: {} })) }))

describe('ClientService', () => {
  beforeEach(() => {
    createTestingPinia({ initialState: { auth: { accessToken: 'token' } } })
    language.current = 'en'
  })
  it('initializes a http authenticated client', () => {
    const createSpy = vi.spyOn(axios, 'create')
    const { clientService, authStore } = getClientServiceMock()
    const client = clientService.httpAuthenticated
    expect(client).toBeInstanceOf(HttpClient)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'Accept-Language': language.current,
          Authorization: `Bearer ${getters['runtime/auth/accessToken']}`,
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': v4uuid
        }
      })
    )
    expect(createSpy).toHaveBeenCalledTimes(1)
    // test re-instantiation on token and language change
    clientService.httpAuthenticated
    expect(createSpy).toHaveBeenCalledTimes(1)
    authStore.accessToken = 'changedToken'
    clientService.httpAuthenticated
    expect(createSpy).toHaveBeenCalledTimes(2)
    language.current = 'de'
    clientService.httpAuthenticated
    expect(createSpy).toHaveBeenCalledTimes(3)
  })
  it('initializes a http unauthenticated client', () => {
    const createSpy = vi.spyOn(axios, 'create')
    const { clientService } = getClientServiceMock()
    const client = clientService.httpUnAuthenticated
    expect(client).toBeInstanceOf(HttpClient)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'Accept-Language': language.current,
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': v4uuid
        }
      })
    )
    expect(createSpy).toHaveBeenCalledTimes(1)
    // test re-instantiation on token and language change
    clientService.httpUnAuthenticated
    expect(createSpy).toHaveBeenCalledTimes(1)
    clientService.httpUnAuthenticated
    language.current = 'de'
    clientService.httpUnAuthenticated
    expect(createSpy).toHaveBeenCalledTimes(2)
  })
  it('initializes an graph client', () => {
    const graphClient = {} as Graph
    vi.mocked(_client).mockImplementation(() => {
      return { graph: graphClient, ocs: {} } as ReturnType<typeof _client>
    })
    const { clientService, authStore } = getClientServiceMock()
    const client = clientService.graphAuthenticated
    expect(_client).toHaveBeenCalledWith(expect.objectContaining({ baseURI: serverUrl }))
    expect(_client).toHaveBeenCalledTimes(1)
    expect(graphClient).toEqual(client)
    // test re-instantiation on token and language change
    clientService.graphAuthenticated
    expect(_client).toHaveBeenCalledTimes(1)
    authStore.accessToken = 'changedToken'
    clientService.graphAuthenticated
    expect(_client).toHaveBeenCalledTimes(2)
    language.current = 'de'
    clientService.graphAuthenticated
    expect(_client).toHaveBeenCalledTimes(3)
  })
  it('initializes an ocs user client', () => {
    const ocsClient = {} as OCS
    vi.mocked(_client).mockImplementation(() => {
      return { graph: {}, ocs: ocsClient } as ReturnType<typeof _client>
    })
    const { clientService, authStore } = getClientServiceMock()
    const client = clientService.ocsUserContext
    expect(_client).toHaveBeenCalledWith(expect.objectContaining({ baseURI: serverUrl }))
    expect(_client).toHaveBeenCalledTimes(1)
    expect(ocsClient).toEqual(client)
    // test re-instantiation on token and language change
    clientService.ocsUserContext
    expect(_client).toHaveBeenCalledTimes(1)
    authStore.accessToken = 'changedToken'
    clientService.ocsUserContext
    expect(_client).toHaveBeenCalledTimes(2)
    language.current = 'de'
    clientService.ocsUserContext
    expect(_client).toHaveBeenCalledTimes(3)
  })
  it('initializes an ocs public link client', () => {
    const ocsClient = {} as OCS
    vi.mocked(_client).mockImplementation(() => {
      return { graph: {}, ocs: ocsClient } as ReturnType<typeof _client>
    })
    const { clientService, authStore } = getClientServiceMock()
    const client = clientService.ocsPublicLinkContext()
    expect(_client).toHaveBeenCalledWith(expect.objectContaining({ baseURI: serverUrl }))
    expect(_client).toHaveBeenCalledTimes(1)
    expect(ocsClient).toEqual(client)
    // test re-instantiation on token and language change
    clientService.ocsPublicLinkContext()
    expect(_client).toHaveBeenCalledTimes(1)
    authStore.accessToken = 'changedToken'
    clientService.ocsPublicLinkContext()
    expect(_client).toHaveBeenCalledTimes(2)
    language.current = 'de'
    clientService.ocsPublicLinkContext()
    expect(_client).toHaveBeenCalledTimes(3)
  })
})
