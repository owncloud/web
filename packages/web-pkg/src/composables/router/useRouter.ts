import { getCurrentInstance } from '@vue/composition-api'
import VueRouter from 'vue-router'

export const useRouter = (): VueRouter => {
  return getCurrentInstance().proxy.$router
}
