import { Router } from 'vue-router'
import { useService } from '../service'

export const useRouter = (): Router => {
  const hack = (window as any).__HACK__router
  if (hack) {
    return hack
  }
  return useService('$router')
}
