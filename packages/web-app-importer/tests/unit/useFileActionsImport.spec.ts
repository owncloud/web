// import { useFileActionsImport } from 'web-app-files/src/composables/actions/files/useFileActionsImport'
// import {
//   createStore,
//   defaultStoreMockOptions,
//   defaultComponentMocks,
//   getComposableWrapper,
//   RouteLocation
// } from 'web-test-helpers'
// import { unref } from 'vue'
// import { Resource } from 'web-client'
// import { useStore } from 'web-pkg/src/composables'
// import { mock, mockDeep } from 'jest-mock-extended'
// import { ConfigurationManager } from 'web-pkg/types'

// describe('useFileActionsImport', () => {
//   describe('isEnabled', () => {
//     it('is false when no companion url is given', () => {
//       getWrapper({
//         currentFolder: mock<Resource>({ canUpload: () => true }),
//         setup: () => {
//           const store = useStore()
//           const configurationManager = mockDeep<ConfigurationManager>()
//           configurationManager.options = { upload: {} }
//           const { actions } = useFileActionsImport({ store, configurationManager })

//           expect(unref(actions)[0].isEnabled()).toBeFalsy()
//         }
//       })
//     })
//     it('is false on public link pages', () => {
//       getWrapper({
//         routeName: 'files-public-link',
//         setup: () => {
//           const store = useStore()
//           const configurationManager = mockDeep<ConfigurationManager>()
//           configurationManager.options = { upload: { companionUrl: 'companionUrl' } }
//           const { actions } = useFileActionsImport({ store, configurationManager })

//           expect(unref(actions)[0].isEnabled()).toBeFalsy()
//         }
//       })
//     })
//     it('is false when no write access is given', () => {
//       getWrapper({
//         currentFolder: mock<Resource>({ canUpload: () => false }),
//         setup: () => {
//           const store = useStore()
//           const configurationManager = mockDeep<ConfigurationManager>()
//           configurationManager.options = { upload: { companionUrl: 'companionUrl' } }
//           const { actions } = useFileActionsImport({ store, configurationManager })

//           expect(unref(actions)[0].isEnabled()).toBeFalsy()
//         }
//       })
//     })
//     it('is true on generic space view when write access is given', () => {
//       getWrapper({
//         currentFolder: mock<Resource>({ canUpload: () => true }),
//         setup: () => {
//           const store = useStore()
//           const configurationManager = mockDeep<ConfigurationManager>()
//           configurationManager.options = { upload: { companionUrl: 'companionUrl' } }
//           const { actions } = useFileActionsImport({ store, configurationManager })

//           expect(unref(actions)[0].isEnabled()).toBeTruthy()
//         }
//       })
//     })
//   })
// })

// function getWrapper({
//   routeName = 'files-spaces-generic',
//   currentFolder = mock<Resource>(),
//   setup = () => undefined
// } = {}) {
//   const mocks = {
//     ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) })
//   }
//   const storeOptions = defaultStoreMockOptions
//   storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)
//   const store = createStore(storeOptions)
//   return {
//     wrapper: getComposableWrapper(setup, {
//       mocks,
//       provide: mocks,
//       store
//     })
//   }
// }

export default {}
