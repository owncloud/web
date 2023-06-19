import { loadTheme } from 'web-runtime/src/helpers/theme'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'
import merge from 'lodash-es/merge'
import fetchMock from 'jest-fetch-mock'

jest.spyOn(console, 'error').mockImplementation(() => undefined)

describe('theme loading and error reporting', () => {
  it('should load the default theme if location is empty', async () => {
    const { web, common } = await loadTheme()
    expect(web).toMatchObject(defaultTheme.web)
    expect(common).toMatchObject(defaultTheme.common)
  })

  it('should load the default theme if location is not a json file extension', async () => {
    const { web, common } = await loadTheme('some_location_without_json_file_ending.xml')
    expect(web).toMatchObject(defaultTheme.web)
    expect(common).toMatchObject(defaultTheme.common)
  })

  it('should load the default theme if location is not found', async () => {
    fetchMock.mockResponse(new Error() as any, { status: 404 })
    const { web, common } = await loadTheme('http://www.owncloud.com/unknown.json')
    expect(web).toMatchObject(defaultTheme.web)
    expect(common).toMatchObject(defaultTheme.common)
  })

  it('should load the default theme if location is not a valid json file', async () => {
    const customTheme = merge({}, defaultTheme, { default: { logo: { login: 'custom.svg' } } })
    fetchMock.mockResponse(JSON.stringify(customTheme) + '-invalid')
    const { web, common } = await loadTheme('http://www.owncloud.com/invalid.json')
    expect(web).toMatchObject(defaultTheme.web)
    expect(common).toMatchObject(defaultTheme.common)
  })

  it('should load the default theme if server errors', async () => {
    fetchMock.mockReject(new Error())
    const { web, common } = await loadTheme('http://www.owncloud.com')
    expect(web).toMatchObject(defaultTheme.web)
    expect(common).toMatchObject(defaultTheme.common)
  })

  it('should load the custom theme if a custom location is given', async () => {
    const customTheme = merge({}, defaultTheme.web, { default: { logo: { login: 'custom.svg' } } })

    fetchMock.mockResponse(JSON.stringify(customTheme))

    const { web: theme1 } = await loadTheme('http://www.owncloud.com/custom.json')
    const { web: theme2 } = await loadTheme('/custom.json')

    expect(theme1).toMatchObject(customTheme)
    expect(theme2).toMatchObject(customTheme)
  })
})
