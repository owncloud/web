import Preview from './preview'
import { SearchPreview, SearchProvider } from '@ownclouders/web-pkg'
import { GitHubClient } from './client'
import { HttpClient } from '@ownclouders/web-pkg'

export class GitHubSearch implements SearchProvider {
  public readonly id: string
  public readonly displayName: string
  public readonly previewSearch: SearchPreview

  constructor() {
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
