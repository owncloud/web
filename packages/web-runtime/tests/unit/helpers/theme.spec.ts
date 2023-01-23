import { loadTheme } from 'web-runtime/src/helpers/theme'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'
import merge from 'lodash-es/merge'
import fetchMock from 'jest-fetch-mock'

jest.spyOn(console, 'error').mockImplementation(() => undefined)

describe('theme loading and error reporting', () => {
  it('should load the default theme if location is empty', async () => {
    const { theme } = await loadTheme()
    expect(theme).toMatchObject(defaultTheme.web)
  })

  it('should load the default theme if location is not a json file extension', async () => {
    const { theme } = await loadTheme('some_location_without_json_file_ending.xml')
    expect(theme).toMatchObject(defaultTheme.web)
  })

  it('should load the default theme if location is not found', async () => {
    fetchMock.mockResponse(new Error() as any, { status: 404 })
    const { theme } = await loadTheme('http://www.owncloud.com/unknown.json')
    expect(theme).toMatchObject(defaultTheme.web)
  })

  it('should load the default theme if location is not a valid json file', async () => {
    const customTheme = merge({}, defaultTheme, { default: { logo: { login: 'custom.svg' } } })
    fetchMock.mockResponse(JSON.stringify(customTheme) + '-invalid')
    const { theme } = await loadTheme('http://www.owncloud.com/invalid.json')
    expect(theme).toMatchObject(defaultTheme.web)
  })

  it('should load the default theme if server errors', async () => {
    fetchMock.mockReject(new Error())
    const { theme } = await loadTheme('http://www.owncloud.com')
    expect(theme).toMatchObject(defaultTheme.web)
  })

  it('should load the custom theme if a custom location is given', async () => {
    const customTheme = merge({}, defaultTheme.web, { default: { logo: { login: 'custom.svg' } } })

    fetchMock.mockResponse(JSON.stringify(customTheme))

    const { theme: theme1 } = await loadTheme('http://www.owncloud.com/custom.json')
    const { theme: theme2 } = await loadTheme('/custom.json')

    expect(theme1).toMatchObject(customTheme)
    expect(theme2).toMatchObject(customTheme)
  })
})
