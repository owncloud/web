import { SearchProvider } from '@ownclouders/web-pkg'

export class ProviderStore {
  public providers: SearchProvider[]

  constructor() {
    this.providers = []
  }

  public addProvider(provider: SearchProvider): void {
    this.providers.push(provider)
  }

  public get availableProviders() {
    return this.providers.filter((provider) => provider.available)
  }
}

export const providerStore = new ProviderStore()
