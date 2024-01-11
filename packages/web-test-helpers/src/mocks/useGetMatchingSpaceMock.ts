import { mock } from 'jest-mock-extended'
import { SpaceResource } from '../../../web-client/src'
import { useGetMatchingSpace } from '../../../web-pkg'
import { PersonalSpaceResource } from '../../../web-client/src/helpers'

export const useGetMatchingSpaceMock = (
  options: Partial<ReturnType<typeof useGetMatchingSpace>> = {}
): ReturnType<typeof useGetMatchingSpace> => {
  return {
    getInternalSpace() {
      return mock<SpaceResource>()
    },
    getMatchingSpace() {
      return mock<SpaceResource>()
    },
    getPersonalSpace() {
      return mock<PersonalSpaceResource>()
    },
    isResourceAccessible() {
      return false
    },
    isPersonalSpaceRoot() {
      return false
    },
    ...options
  }
}
