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

export async function userFiltersSearchResultWithTag({
  actorsEnvironment,
  stepUser,
  tag
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  tag: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectTagFilter({ tag })
}

export async function userClearsFilter({
  actorsEnvironment,
  stepUser,
  filter
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  filter: 'mediaType' | 'tags' | 'lastModified' | 'fullText'
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.clearFilter({ filter })
}

export async function userEnablesTitleOnlySearch({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.toggleSearchTitleOnly({ enableOrDisable: 'enable' })
}

export async function userFiltersSearchByMediaType({
  actorsEnvironment,
  stepUser,
  mediaType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  mediaType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectMediaTypeFilter({ mediaType })
}

export async function userFiltersSearchByLastModifiedDate({
  actorsEnvironment,
  stepUser,
  lastModified
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  lastModified: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectlastModifiedFilter({ lastModified })
}
