import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import { AppProviderService, useModals, useRequest, useRoute } from '@ownclouders/web-pkg'
import { computed } from 'vue'

import { Resource } from '@ownclouders/web-client'
import App from '../../src/App.vue'
import { RouteLocation } from 'vue-router'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useRequest: vi.fn(),
  useRoute: vi.fn(),
  useModals: vi.fn()
}))

const appUrl = 'https://example.test/d12ab86/loe009157-MzBw'
const appOrigin = 'https://example.test'

const providerSuccessResponsePost = {
  app_url: appUrl,
  method: 'POST',
  form_parameters: {
    access_token: 'asdfsadfsadf',
    access_token_ttl: '123456'
  }
}

const providerSuccessResponseGet = {
  app_url: appUrl,
  method: 'GET'
}

describe('The app provider extension', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('should fail for unauthenticated users', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 401,
      message: 'Login Required'
    })
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should be able to load an iFrame via get', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: providerSuccessResponseGet
    })

    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should be able to load an iFrame via post', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: providerSuccessResponsePost
    })
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

describe('Collabora Save As postMessage handling', () => {
  const successGet = { ok: true, status: 200, data: providerSuccessResponseGet }

  const flushAppUrl = async (wrapper: any) => {
    for (let i = 0; i < 5; i++) {
      await wrapper.vm.$nextTick()
    }
  }

  const dispatchEditorMessage = (origin: string, messageId: string) => {
    window.dispatchEvent(
      new MessageEvent('message', { origin, data: JSON.stringify({ MessageId: messageId }) })
    )
  }

  const stubIframeContentWindow = (wrapper: any) => {
    const postMessage = vi.fn()
    const iframe = wrapper.find('iframe')
    Object.defineProperty(iframe.element, 'contentWindow', {
      value: { postMessage },
      configurable: true
    })
    return { iframe, postMessage }
  }

  it('ignores editor messages until the editor origin is known (fail closed)', async () => {
    // makeRequest never resolves -> appUrl stays undefined -> origin unknown
    const makeRequest = vi.fn().mockReturnValue(new Promise(() => undefined))
    const { wrapper, dispatchModal } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()

    dispatchEditorMessage(appOrigin, 'UI_SaveAs')

    expect(dispatchModal).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('drops editor messages coming from a foreign origin', async () => {
    const makeRequest = vi.fn().mockResolvedValue(successGet)
    const { wrapper, dispatchModal } = createShallowMountWrapper(makeRequest)
    await flushAppUrl(wrapper)

    dispatchEditorMessage('https://evil.test', 'UI_SaveAs')

    expect(dispatchModal).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('opens the modal on UI_SaveAs from the editor origin and posts Action_SaveAs on confirm', async () => {
    const makeRequest = vi.fn().mockResolvedValue(successGet)
    const { wrapper, dispatchModal } = createShallowMountWrapper(makeRequest)
    await flushAppUrl(wrapper)
    const { postMessage } = stubIframeContentWindow(wrapper)

    dispatchEditorMessage(appOrigin, 'UI_SaveAs')

    expect(dispatchModal).toHaveBeenCalledTimes(1)
    const modal = dispatchModal.mock.calls[0][0] as any
    expect(modal.hasInput).toBe(true)

    modal.onConfirm('export.pdf')

    expect(postMessage).toHaveBeenCalledTimes(1)
    const [payload, targetOrigin] = postMessage.mock.calls[0]
    expect(targetOrigin).toBe(appOrigin)
    expect(JSON.parse(payload as string)).toMatchObject({
      MessageId: 'Action_SaveAs',
      Values: { Filename: 'export.pdf', Notify: true }
    })
    wrapper.unmount()
  })

  it('rejects empty and path-separator file names in the modal', async () => {
    const makeRequest = vi.fn().mockResolvedValue(successGet)
    const { wrapper, dispatchModal } = createShallowMountWrapper(makeRequest)
    await flushAppUrl(wrapper)
    const { postMessage } = stubIframeContentWindow(wrapper)

    dispatchEditorMessage(appOrigin, 'UI_SaveAs')
    const modal = dispatchModal.mock.calls[0][0] as any

    const setError = vi.fn()
    modal.onInput('', setError)
    expect(setError).toHaveBeenLastCalledWith(expect.stringContaining('empty'))
    modal.onInput('foo/bar.pdf', setError)
    expect(setError).toHaveBeenLastCalledWith(expect.stringContaining('/'))
    modal.onInput('valid.pdf', setError)
    expect(setError).toHaveBeenLastCalledWith('')

    // a confirm with an invalid name must not post anything
    modal.onConfirm('foo/bar.pdf')
    expect(postMessage).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('posts Host_PostmessageReady when the editor iframe loads', async () => {
    const makeRequest = vi.fn().mockResolvedValue(successGet)
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await flushAppUrl(wrapper)
    const { iframe, postMessage } = stubIframeContentWindow(wrapper)

    await iframe.trigger('load')

    expect(postMessage).toHaveBeenCalledTimes(1)
    const [payload, targetOrigin] = postMessage.mock.calls[0]
    expect(targetOrigin).toBe(appOrigin)
    expect(JSON.parse(payload as string)).toMatchObject({ MessageId: 'Host_PostmessageReady' })
    wrapper.unmount()
  })
})

function createShallowMountWrapper(makeRequest = vi.fn().mockResolvedValue({ status: 200 })) {
  vi.mocked(useRequest).mockImplementation(() => ({
    makeRequest
  }))

  vi.mocked(useRoute).mockReturnValue(
    computed(() => mock<RouteLocation>({ name: 'external-example-app-apps' }))
  )

  const dispatchModal = vi.fn()
  vi.mocked(useModals).mockReturnValue(mock<ReturnType<typeof useModals>>({ dispatchModal }))

  const mocks = {
    ...defaultComponentMocks(),
    $appProviderService: mock<AppProviderService>({ appNames: ['example-app'] })
  }

  const capabilities = {
    files: {
      app_providers: [{ apps_url: '/app/list', enabled: true, open_url: '/app/open' }]
    }
  }

  return {
    dispatchModal,
    wrapper: shallowMount(App, {
      props: {
        space: null,
        resource: mock<Resource>({ name: 'document.odt' }),
        isReadOnly: false
      },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { editor: { openAsPreview: true } } }
            }
          })
        ],
        provide: mocks,
        mocks
      }
    })
  }
}
