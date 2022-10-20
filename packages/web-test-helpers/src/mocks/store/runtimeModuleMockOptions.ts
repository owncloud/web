export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      spaces: {
        namespaced: true,
        actions: {
          loadSpaceMembers: jest.fn()
        }
      }
    }
  }
}
