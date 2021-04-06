import { loadTheme } from 'web-runtime/src/helpers/theme'
import { merge } from 'lodash'
import defaultTheme from 'web-runtime/themes/owncloud.json'
const defaultName = 'themes/owncloud/theme.json'

describe('theme loading and error reporting', () => {
  it('should load the default theme if no name is given', async () => {
    const { theme, name } = await loadTheme()
    expect(theme).toMatchObject(defaultTheme)
    expect(name).toMatch(defaultName)
  })

  it('should load the default theme if default name is given', async () => {
    const { theme, name } = await loadTheme(defaultName)
    expect(theme).toMatchObject(defaultTheme)
    expect(name).toMatch(defaultName)
  })

  it('should load the default theme if name is unknown', async () => {
    fetch.mockResponseOnce(new Error(), { status: 404 })
    const { theme, name } = await loadTheme('unknown.json')
    expect(theme).toMatchObject(defaultTheme)
    expect(name).toMatch(defaultName)
  })

  it('should load the default theme if server errors', async () => {
    fetch.mockRejectOnce(new Error())
    const { theme, name } = await loadTheme('something.json')
    expect(theme).toMatchObject(defaultTheme)
    expect(name).toMatch(defaultName)
  })

  it('should load the custom theme if a custom name is given', async () => {
    const customTheme = merge({}, defaultTheme, { logo: { login: 'custom.svg' } })
    const customName = 'themes/custom/theme.json'
    fetch.mockResponseOnce(JSON.stringify(customTheme))

    const { theme, name } = await loadTheme(customName)
    expect(theme).toMatchObject(customTheme)
    expect(name).toMatch(customName)
  })
})
