import { isEqual } from 'lodash-es'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'

export const loadTheme = async (location = '') => {
  const defaults = { theme: defaultTheme }

  if (location.split('.').pop() !== 'json') {
    if (isEqual(process.env.NODE_ENV, 'development')) {
      console.info(`Theme '${location}' does not specify a json file, using default theme.`)
    }
    return defaults
  }

  try {
    const response = await fetch(location)
    if (!response.ok) {
      return defaults
    }
    const theme = await response.json()
    return { theme }
  } catch (e) {
    console.error(
      `Failed to load theme '${location}' is not a valid json file, using default theme.`
    )
    return defaults
  }
}
