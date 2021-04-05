import defaultTheme from 'web-runtime/themes/owncloud.json'
export const loadTheme = async (name = '') => {
  const defaults = { theme: defaultTheme, name: 'themes/owncloud/theme.json' }

  if (name === '' || name === defaults.name) {
    return defaults
  }

  let response
  try {
    response = await fetch(name)
  } catch (e) {
    return defaults
  }

  if (!response.ok) {
    return defaults
  }

  const customTheme = await response.json()
  return { theme: customTheme, name }
}
