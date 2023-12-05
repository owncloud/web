import { isEqual } from 'lodash-es'
import defaultTheme from '../../themes/owncloud/theme.json'
import { v4 as uuidV4 } from 'uuid'

export const loadTheme = async (location = '') => {
  const defaultOwnCloudTheme = {
    defaults: {
      ...defaultTheme.clients.web.defaults,
      common: defaultTheme.common
    },
    themes: defaultTheme.clients.web.themes
  }

  if (location.split('.').pop() !== 'json') {
    if (isEqual(process.env.NODE_ENV, 'development')) {
      console.info(`Theme '${location}' does not specify a json file, using default theme.`)
    }
    return defaultOwnCloudTheme
  }

  try {
    const response = await fetch(location, { headers: { 'X-Request-ID': uuidV4() } })
    if (!response.ok) {
      return defaultOwnCloudTheme
    }
    const theme = await response.json()
    // Check if web key (with default and themes) is in the loaded theme, else log error and use default theme?
    return theme.clients.web || {}
  } catch (e) {
    console.error(`Failed to load theme '${location}', using default theme.`)
    return defaultOwnCloudTheme
  }
}
