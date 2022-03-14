import { getCurrentInstance } from '@vue/composition-api'
import { ClientService } from '../../services'

export const useClientService = (): ClientService => {
  return (getCurrentInstance().proxy as any).$clientService
}
