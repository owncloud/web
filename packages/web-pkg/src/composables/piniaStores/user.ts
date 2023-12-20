import { setUser as sentrySetUser } from '@sentry/vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'

export const useUserStore = defineStore('user', () => {
  const user = ref<User>()

  const setUser = (data: User) => {
    user.value = data
    sentrySetUser({ username: data.onPremisesSamAccountName })
  }

  return {
    user,
    setUser
  }
})

export type UserStore = ReturnType<typeof useUserStore>
