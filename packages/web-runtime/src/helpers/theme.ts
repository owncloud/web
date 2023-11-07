import { isEqual } from 'lodash-es'
import defaultTheme from '../../themes/owncloud/theme.json'
import { v4 as uuidV4 } from 'uuid'

export const loadTheme = async (location = '') => {
  const defaults = { web: defaultTheme.web, common: defaultTheme.common }

  if (location.split('.').pop() !== 'json') {
    if (isEqual(process.env.NODE_ENV, 'development')) {
      console.info(`Theme '${location}' does not specify a json file, using default theme.`)
    }
    return defaults
  }

  try {
    const response = await fetch(location, { headers: { 'X-Request-ID': uuidV4() } })
    if (!response.ok) {
      return defaults
    }
    const theme = await response.json()
    return { web: theme.web, common: theme.common || {} }
  } catch (e) {
    console.error(
      `Failed to load theme '${location}' is not a valid json file, using default theme.`
    )
    return defaults
  }
}
