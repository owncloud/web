import { mock } from 'vitest-mock-extended'
import { useExtensionRegistry } from '../../../web-pkg'

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
