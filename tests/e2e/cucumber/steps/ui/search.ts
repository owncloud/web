import { When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

Then(
  '{string} should see the message {string} on the search result',
  async function (this: World, stepUser: string, message: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    const actualMessage = await searchObject.getSearchResultMessage()
    expect(actualMessage).toBe(message)
  }
)

When(
  '{string} selects tag {string} from the search result filter chip',
  async function (this: World, stepUser: string, tag: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    await searchObject.selectTagFilter({ tag })
  }
)

When(
  /^"([^"]*)" (enable|disable)s the option to search title only?$/,
  async function (this: World, stepUser: string, enableOrDisable: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    await searchObject.toggleSearchTitleOnly({ enableOrDisable })
  }
)
When(
  '{string} selects mediaType {string} from the search result filter chip',
  async function (this: World, stepUser: string, mediaType: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    await searchObject.selectMediaTypeFilter({ mediaType })
  }
)
When(
  '{string} selects lastModified {string} from the search result filter chip',
  async function (this: World, stepUser: string, lastModified: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    await searchObject.selectlastModifiedFilter({ lastModified })
  }
)
When(
  /^"([^"].*)" clears (mediaType|tags|lastModified|fullText) filter$/,
  async function (this: World, stepUser: string, filter: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const searchObject = new objects.applicationFiles.Search({ page })
    await searchObject.clearFilter({
      filter: filter as 'mediaType' | 'tags' | 'lastModified' | 'fullText'
    })
  }
)
