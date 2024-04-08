import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useClientStore = defineStore('client', () => {
  const clientInitiatorId = ref<string>()
  const setClientInitiatorId = (id: string) => {
    clientInitiatorId.value = id
  }

  return {
    clientInitiatorId,
    setClientInitiatorId
  }
})

export type ClientStore = ReturnType<typeof useClientStore>
