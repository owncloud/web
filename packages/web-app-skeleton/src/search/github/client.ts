import { HttpClient } from '@ownclouders/web-pkg'

export interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  topics: string[]
}

interface RepositoriesSearch {
  total_count: number
  items: Repository[]
}

export class GitHubClient {
  private readonly httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }
  public async searchRepositories(q: string): Promise<RepositoriesSearch> {
    const { data } = await this.httpClient.get<RepositoriesSearch>(
      `https://api.github.com/search/repositories?q=${q}`
    )

    return data
  }
}
