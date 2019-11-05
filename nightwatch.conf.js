const chromedriver = require('chromedriver')
let LOCAL_LAUNCH_URL = process.env.SERVER_HOST || 'http://localhost:8300'
LOCAL_LAUNCH_URL = LOCAL_LAUNCH_URL.startsWith('http') ? LOCAL_LAUNCH_URL : 'http://' + LOCAL_LAUNCH_URL
let LOCAL_BACKEND_URL = process.env.BACKEND_HOST || 'http://localhost:8080'
const BACKEND_ADMIN_USERNAME = process.env.BACKEND_USERNAME || 'admin'
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_PASSWORD || 'admin'
LOCAL_BACKEND_URL = LOCAL_BACKEND_URL.startsWith('http') ? LOCAL_BACKEND_URL : 'http://' + LOCAL_BACKEND_URL
const SELENIUM_HOST = process.env.SELENIUM_HOST || ''
const SELENIUM_PORT = process.env.SELENIUM_PORT || 4444
const START_PROCESS = (SELENIUM_HOST === '')
const REMOTE_UPLOAD_DIR = process.env.REMOTE_UPLOAD_DIR || require('path').join(__dirname, '/tests/acceptance/filesForUpload/')
const SAUCE_USERNAME = process.env.SAUCE_USERNAME
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY
const BROWSER_NAME = process.env.BROWSER_NAME
const SAUCELABS_TUNNEL_NAME = process.env.SAUCELABS_TUNNEL_NAME
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR

if (process.env.LOCAL_UPLOAD_DIR === undefined) {
  console.warn(
    `LOCAL_UPLOAD_DIR not set. Folder uploads might fail.
    Please refer to 'Running acceptance tests' on how to run tests.`
  )
}

module.exports = {
  page_objects_path: './tests/acceptance/pageObjects',
  custom_commands_path: './tests/acceptance/customCommands',
  test_settings: {
    default: {
      globals: {
        waitForConditionPollInterval: 10,
        filesForUpload: REMOTE_UPLOAD_DIR,
        mountedUploadDir: LOCAL_UPLOAD_DIR
      }
    },
    local: {
      launch_url: LOCAL_LAUNCH_URL,
      globals: {
        waitForConditionTimeout: 10000,
        backend_url: LOCAL_BACKEND_URL,
        backend_admin_username: BACKEND_ADMIN_USERNAME,
        backend_admin_password: BACKEND_ADMIN_PASSWORD
      },
      selenium_host: SELENIUM_HOST,
      webdriver: {
        start_process: START_PROCESS,
        server_path: chromedriver.path,
        port: SELENIUM_PORT,
        use_legacy_jsonwire: false,
        cli_args: ['--port=' + SELENIUM_PORT]
      },
      screenshots: {
        enabled: true,
        path: 'tests/reports/screenshots',
        on_failure: true
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: ['disable-gpu'],
          w3c: false
        }
      }
    },
    drone: {
      launch_url: 'http://phoenix',
      globals: {
        waitForConditionTimeout: 20000,
        backend_url: 'http://owncloud',
        backend_admin_username: 'admin',
        backend_admin_password: 'admin'
      },
      selenium_host: SAUCE_USERNAME ? 'saucelabs' : 'selenium',
      webdriver: {
        start_process: false,
        use_legacy_jsonwire: false,
        port: SELENIUM_PORT
      },
      screenshots: {
        enabled: !SAUCE_USERNAME,
        path: 'tests/reports/screenshots',
        on_failure: !SAUCE_USERNAME
      },
      desiredCapabilities: {
        browserName: BROWSER_NAME || 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        username: SAUCE_USERNAME,
        access_key: SAUCE_ACCESS_KEY,
        chromeOptions: SAUCE_USERNAME ? undefined : {
          args: ['disable-gpu', 'disable-dev-shm-usage'],
          w3c: false
        },
        tunnelIdentifier: SAUCELABS_TUNNEL_NAME,
        idleTimeout: 180,
        screenResolution: SAUCE_USERNAME ? '1280x1024' : undefined
      }
    }
  }
}
