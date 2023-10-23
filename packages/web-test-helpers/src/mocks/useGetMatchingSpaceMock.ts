import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from '../../../web-client/src'
import { useGetMatchingSpace } from '../../../web-pkg'
import { PersonalSpaceResource } from '../../../web-client/src/helpers'

export const useGetMatchingSpaceMock = (
  options: Partial<ReturnType<typeof useGetMatchingSpace>> = {}
): ReturnType<typeof useGetMatchingSpace> => {
  return {
    getInternalSpace(storageId: string) {
      return mock<SpaceResource>()
    },
    getMatchingSpace(resource: Resource) {
      return mock<SpaceResource>()
    },
    getPersonalSpace() {
      return mock<PersonalSpaceResource>()
    },
    isResourceAccessible({ space, path }) {
      return false
    },
    ...options
  }
}
