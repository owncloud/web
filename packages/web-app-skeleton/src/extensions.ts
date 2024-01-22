import { Extension } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { GitHubSearch } from './search/github'

export const extensions = () => {
  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.skeleton.search.github',
          type: 'search',
          searchProvider: new GitHubSearch()
        }
      ] satisfies Extension[]
  )
}
