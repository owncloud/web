import { SSEEventOptions } from './types'

export const onSSEBackchannelLogoutEvent = async ({ router }: SSEEventOptions) => {
  return router.push({ name: 'logout' })
}
