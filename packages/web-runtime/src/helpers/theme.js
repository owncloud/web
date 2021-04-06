import defaultTheme from 'web-runtime/themes/owncloud/theme.json'

export const loadTheme = async (location = '') => {
  const defaults = { theme: defaultTheme }

  if (location.split('.').pop() !== 'json') {
    return defaults
  }

  let response
  try {
    response = await fetch(location)
  } catch (e) {
    return defaults
  }

  if (!response.ok) {
    return defaults
  }

  const theme = await response.json()
  return { theme }
}
