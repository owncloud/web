import { getCurrentInstance } from 'vue'
import VueRouter from 'vue-router'

export const useRouter = (): VueRouter => {
  return getCurrentInstance().proxy.$router
}
