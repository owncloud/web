import { loadTheme } from 'web-runtime/src/helpers/theme'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'

describe('theme loading and error reporting', () => {
  it('should load the default theme if location is empty', async () => {
    const { theme } = await loadTheme()
    expect(theme).toMatchObject(defaultTheme)
  })

  it('should load the default theme if location is not a json file', async () => {
    const { theme } = await loadTheme('some_location_without_json_file_ending')
    expect(theme).toMatchObject(defaultTheme)
  })

  it('should load the default theme if location url uses a unsupported protocol', async () => {
    const { theme } = await loadTheme('ftp://www.owncloud.com')
    expect(theme).toMatchObject(defaultTheme)
  })

  it('should load the default theme if location errors', async () => {
    fetch.mockResponseOnce(new Error(), { status: 404 })
    const { theme } = await loadTheme('http://www.owncloud.com/unknown.json')
    expect(theme).toMatchObject(defaultTheme)
  })

  it('should load the default theme if server errors', async () => {
    fetch.mockRejectOnce(new Error())
    const { theme } = await loadTheme('http://www.owncloud.com')
    expect(theme).toMatchObject(defaultTheme)
  })

  // TODO: enable test again and fix it
  // it('should load the custom theme if a custom location is given', async () => {
  //   const customTheme = merge({}, defaultTheme, { default: { logo: { login: 'custom.svg' } } })
  //
  //   fetch.mockResponseOnce(JSON.stringify(customTheme))
  //   const { theme: theme1 } = await loadTheme('http://www.owncloud.com/custom.json')
  //   expect(theme1).toMatchObject(customTheme)
  //
  //   fetch.mockResponseOnce(JSON.stringify(customTheme))
  //   const { theme: theme2 } = await loadTheme('https://www.owncloud.com/custom.json')
  //   expect(theme2).toMatchObject(customTheme)
  // })
})
