import { useTask } from 'vue-concurrency'

export function useLoadTokenInfo() {
  const loadTokenInfoTask = useTask(function* () {
    return {}
  })

  return { loadTokenInfoTask }
}
