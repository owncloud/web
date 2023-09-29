import { ConfigurationManager } from '@ownclouders/web-pkg'
import { v4 as uuidV4 } from 'uuid'
import merge from 'lodash-es/merge'

export const loadCustomTranslations = async ({
  configurationManager
}: {
  configurationManager: ConfigurationManager
}): Promise<unknown> => {
  const customTranslations = {}
  for (const customTranslation of configurationManager.customTranslations) {
    const customTranslationResponse = await fetch(customTranslation.url, {
      headers: { 'X-Request-ID': uuidV4() }
    })
    if (customTranslationResponse.status !== 200) {
      console.error(
        `translation file ${customTranslation} could not be loaded. HTTP status-code ${customTranslationResponse.status}`
      )
      continue
    }
    try {
      const customTranslationJSON = await customTranslationResponse.json()
      merge(customTranslations, customTranslationJSON)
    } catch (e) {
      console.error(`translation file ${customTranslation} could not be parsed. ${e}`)
    }
  }
  return customTranslations
}
