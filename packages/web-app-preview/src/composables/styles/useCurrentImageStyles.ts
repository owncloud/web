import { StyleCategoryEnum } from '../../helpers'
import { useStore } from 'web-pkg/src'

export const useCurrentImageStyles = (imageStyleType: StyleCategoryEnum) => {
  const store = useStore()

  switch (imageStyleType) {
    case StyleCategoryEnum.General:
      return store.getters['Preview/customizeGeneral']
    case StyleCategoryEnum.FineTune:
      return store.getters['Preview/customizeFineTune']
    default:
      return []
  }
}
