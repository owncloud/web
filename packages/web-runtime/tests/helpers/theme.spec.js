import { loadTheme } from 'web-runtime/src/helpers/theme'
import { merge } from 'lodash'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'

describe('theme loading and error reporting', () => {
  it('should load the default theme if location is empty', async () => {
    const { theme } = await loadTheme()
    expect(theme).toMatchObject(defaultTheme)
  })

  it('should load the default theme if location is not a url', async () => {
    const { theme: theme1 } = await loadTheme('foo_bar_baz')
    const { theme: theme2 } = await loadTheme('/foo/bar/baz')
    const { theme: theme3 } = await loadTheme('foo/bar/baz')
    const { theme: theme4 } = await loadTheme('/foo/bar/baz/')
    const { theme: theme5 } = await loadTheme('foo/bar/baz/')
    const { theme: theme6 } = await loadTheme('foo_bar_baz.json')
    const { theme: theme7 } = await loadTheme('/foo/bar/baz.json')
    const { theme: theme8 } = await loadTheme('foo/bar/baz.json')

    expect(theme1).toMatchObject(defaultTheme)
    expect(theme2).toMatchObject(defaultTheme)
    expect(theme3).toMatchObject(defaultTheme)
    expect(theme4).toMatchObject(defaultTheme)
    expect(theme5).toMatchObject(defaultTheme)
    expect(theme6).toMatchObject(defaultTheme)
    expect(theme7).toMatchObject(defaultTheme)
    expect(theme8).toMatchObject(defaultTheme)
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

  it('should load the custom theme if a custom location is given', async () => {
    const customTheme = merge({}, defaultTheme, { default: { logo: { login: 'custom.svg' } } })

    fetch.mockResponseOnce(JSON.stringify(customTheme))
    const { theme: theme1 } = await loadTheme('http://www.owncloud.com/custom.json')
    expect(theme1).toMatchObject(customTheme)

    fetch.mockResponseOnce(JSON.stringify(customTheme))
    const { theme: theme2 } = await loadTheme('https://www.owncloud.com/custom.json')
    expect(theme2).toMatchObject(customTheme)
  })
})
