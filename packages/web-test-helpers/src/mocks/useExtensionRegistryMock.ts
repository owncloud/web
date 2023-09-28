import { mock } from 'jest-mock-extended'
import { useExtensionRegistry } from '../../../web-pkg/src'

export const useExtensionRegistryMock = (
  options: Partial<ReturnType<typeof useExtensionRegistry>> = {}
): ReturnType<typeof useExtensionRegistry> => {
  return {
    ...mock<ReturnType<typeof useExtensionRegistry>>(),
    registerExtensions: () => undefined,
    requestExtensions: () => [],
    ...options
  }
}
