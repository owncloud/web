import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppError {
  message: string
  status?: number
}

export const useAppStore = defineStore('app', () => {
  // Global error state
  const error = ref<AppError | null>(null)

  return {
    error
  }
})
