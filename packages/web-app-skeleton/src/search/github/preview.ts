import { SearchPreview, SearchResult } from 'web-app-search/src/types'
import PreviewComponent from './PreviewComponent.vue'
import { Component } from 'vue'
import { GitHubClient } from './client'

export const previewSearchLimit = 3

export default class Preview implements SearchPreview {
  public readonly component: Component
  private readonly gitHubClient: GitHubClient

  constructor(gitHubClient: GitHubClient) {
    this.component = PreviewComponent
    this.gitHubClient = gitHubClient
  }

  public async search(term: string): Promise<SearchResult> {
    const searchResultSet = {
      totalResults: null,
      values: []
    }

    if (!term) {
      return searchResultSet
    }

    const { items } = await this.gitHubClient.searchRepositories(term)

    searchResultSet.values = items.slice(0, previewSearchLimit)
    searchResultSet.totalResults = searchResultSet.values.length

    return searchResultSet
  }

  public get available(): boolean {
    return true
  }
}
