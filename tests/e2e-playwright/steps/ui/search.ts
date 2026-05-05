import { objects } from '../../../e2e/support'
import { substitute } from '../../../e2e/support/utils'
import { World } from '../../support/world'
import { searchFilter } from '../../support/constants'

export async function userShouldSeeMessageOnSearchResult({
  world,
  stepUser,
  message
}: {
  world: World
  stepUser: string
  message: string
}): Promise<boolean> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  const actualMessage = await searchObject.getSearchResultMessage()
  return actualMessage === substitute(message)
}

export async function userFiltersSearchResultWithTag({
  world,
  stepUser,
  tag
}: {
  world: World
  stepUser: string
  tag: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectTagFilter({ tag })
}

export async function userClearsFilter({
  world,
  stepUser,
  filter
}: {
  world: World
  stepUser: string
  filter:
    | typeof searchFilter.mediaType
    | typeof searchFilter.tags
    | typeof searchFilter.lastModified
    | typeof searchFilter.fullText
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.clearFilter({ filter })
}

export async function userEnablesTitleOnlySearch({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.toggleSearchTitleOnly({ enableOrDisable: 'enable' })
}

export async function userFiltersSearchByMediaType({
  world,
  stepUser,
  mediaType
}: {
  world: World
  stepUser: string
  mediaType: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectMediaTypeFilter({ mediaType })
}

export async function userFiltersSearchByLastModifiedDate({
  world,
  stepUser,
  lastModified
}: {
  world: World
  stepUser: string
  lastModified: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const searchObject = new objects.applicationFiles.Search({ page })
  await searchObject.selectlastModifiedFilter({ lastModified })
}
