import { loadConfig } from 'web-runtime/src/helpers/config'

const validConfig = `{
  "server" : "http://localhost/owncloud-core",
  "theme": "http://localhost/themes/owncloud/theme.json",
  "version": "0.1.0",
  "auth": {
    "clientId": "bZrw9cijQ9JGf6wDcLCEuiT9iyah2OzzRycjZc30WDEkMHMRybv7VXENbYGbqy3H",
    "url": "http://localhost/owncloud-core/index.php/apps/oauth2/api/v1/token",
    "authUrl": "http://localhost/owncloud-core/index.php/apps/oauth2/authorize"
  },
  "apps": [
    "files",
    "media-viewer"
  ],
  "external_apps": [
    {
      "id": "draw-io",
      "path": "web-app-draw-io",
      "config": {
        "url": "https://embed.diagrams.net",
        "autosave": false,
        "theme": "minimal"
      }
    }
  ]
}`

describe('config file loading and error reporting', () => {
  it('should load and parse a valid config', function() {
    fetch.mockResponseOnce(validConfig)
    return loadConfig().then(async result => {
      expect(await result).toMatchObject(JSON.parse(validConfig))
    })
  })
  describe('empty config', () => {
    it('should throw an exception', function() {
      fetch.mockResponseOnce('')
      return expect(loadConfig).rejects.toThrow(
        'config could not be parsed. ' +
          'FetchError: invalid json response body at  ' +
          'reason: Unexpected end of JSON input'
      )
    })
  })
  describe('config with an trailing comma', () => {
    it('should throw an exception', function() {
      fetch.mockResponseOnce('"title": { "en": "Classic Design", "de": "Dateien", },')
      return expect(loadConfig).rejects.toThrow(
        'config could not be parsed. ' +
          'FetchError: invalid json response body at  ' +
          'reason: Unexpected token : in JSON at position 7'
      )
    })
  })
})
describe('missing config', () => {
  it('should throw an exception', function() {
    fetch.mockResponseOnce(
      '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">\n' +
        '<html><head>\n' +
        '<title>404 Not Found</title>\n' +
        '</head><body>\n' +
        '<h1>Not Found</h1>\n' +
        '<p>The requested URL was not found on this server.</p>\n' +
        '<hr>\n' +
        '<address>Apache/2.4.43 (Ubuntu) Server at localhost Port 80</address>\n' +
        '</body></html>\n',
      { status: 404 }
    )
    return expect(loadConfig).rejects.toThrow('config could not be loaded. HTTP status-code 404')
  })
})
