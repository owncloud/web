import { HttpClient } from 'web-pkg/src/http'
import { SearchResult } from 'search/src/types'

class WikiService {
  private readonly client: HttpClient

  constructor() {
    this.client = new HttpClient()
  }

  public async search(term: string, limit: number): Promise<SearchResult[]> {
    if (!term) {
      return
    }

    const { data } = await this.client.get(`https://en.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        list: 'search',
        origin: '*',
        format: 'json',
        srlimit: limit,
        srsearch: term
      }
    })

    return (data.query.search || []).map(result => ({ id: result.pageid, data: result }))
  }
}

export const wikiService = new WikiService()
