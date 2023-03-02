import Preview from './preview'
import { SearchPreview, SearchProvider } from 'web-app-search/src/types'
import { EventBus } from 'web-pkg/src/services/eventBus'
import { GitHubClient } from './client'
import { HttpClient } from 'web-pkg'

export class GitHubSearch extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly displayName: string
  public readonly previewSearch: SearchPreview

  constructor() {
    super()

    const httpClient = new HttpClient()
    const gitHubClient = new GitHubClient(httpClient)

    this.id = 'skeleton.gh'
    this.displayName = 'GitHub'
    this.previewSearch = new Preview(gitHubClient)
  }

  public get available(): boolean {
    return true
  }
}
