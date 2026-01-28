import { objects } from '../../../e2e/support'
import { ActorsEnvironment } from '../../../e2e/support/environment'
import { substitute } from '../../../e2e/support/utils'

export async function userShouldSeeMessageOnSearchResult({
  actorsEnvironment,
  stepUser,
  message
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  message: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  const actualMessage = await searchObject.getSearchResultMessage()
  return actualMessage === substitute(message)
}