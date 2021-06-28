import { SearchProvider } from '../types'

class ProviderStore {
  public providers: SearchProvider[]

  constructor() {
    this.providers = []
  }

  public addProvider(provider: SearchProvider): void {
    this.providers.push(provider)
  }

  public get availableProviders() {
    return this.providers.filter(provider => provider.available)
  }
}

export default new ProviderStore()
