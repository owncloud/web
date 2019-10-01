const chromedriver = require('chromedriver')
let LOCAL_LAUNCH_URL = process.env.SERVER_HOST || 'http://localhost:8300'
LOCAL_LAUNCH_URL = LOCAL_LAUNCH_URL.startsWith('http') ? LOCAL_LAUNCH_URL : 'http://' + LOCAL_LAUNCH_URL
let LOCAL_BACKEND_URL = process.env.BACKEND_HOST || 'http://localhost:8080'
const BACKEND_ADMIN_USERNAME = process.env.BACKEND_USERNAME || 'admin'
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_PASSWORD || 'admin'
LOCAL_BACKEND_URL = LOCAL_BACKEND_URL.startsWith('http') ? LOCAL_BACKEND_URL : 'http://' + LOCAL_BACKEND_URL
const SELENIUM_HOST = process.env.SELENIUM_HOST || ''
const SELENIUM_PORT = process.env.SELENIUM_PORT || 4445
const START_PROCESS = (SELENIUM_HOST === '')
const FILES_FOR_UPLOAD = process.env.FILES_FOR_UPLOAD || require('path').join(__dirname, '/tests/acceptance/filesForUpload/')

module.exports = {
  page_objects_path: './tests/acceptance/pageObjects',
  custom_commands_path: './tests/acceptance/customCommands',
  test_settings: {
    default: {
      globals: {
        waitForConditionTimeout: 60000,
        waitForConditionPollInterval: 50,
        filesForUpload: FILES_FOR_UPLOAD
      }
    },
    local: {
      launch_url: LOCAL_LAUNCH_URL,
      globals: {
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
      launch_url: 'http://phoenix:8300',
      globals: {
        backend_url: 'http://owncloud',
        backend_admin_username: 'admin',
        backend_admin_password: 'admin'
      },
      selenium_host: 'selenium',
      webdriver: {
        start_process: false,
        use_legacy_jsonwire: false
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
          args: ['disable-gpu', 'disable-dev-shm-usage'],
          w3c: false
        }
      }
    }
  }
}
