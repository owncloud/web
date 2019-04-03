const chromedriver = require('chromedriver')
const LOCAL_LAUNCH_URL = process.env.SERVER_HOST || 'http://localhost:8300'
let LOCAL_BACKEND_URL = process.env.BACKEND_HOST || 'http://localhost:8080'
const BACKEND_ADMIN_USERNAME = process.env.BACKEND_USERNAME || 'admin'
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_PASSWORD || 'admin'
LOCAL_BACKEND_URL = LOCAL_BACKEND_URL.startsWith('http') ? LOCAL_BACKEND_URL : 'http://' + LOCAL_BACKEND_URL

module.exports = {
  page_objects_path: './tests/acceptance/pageObjects',
  custom_commands_path: './tests/acceptance/customCommands',
  test_settings: {
    default: {
      globals: {
        waitForConditionTimeout: 10000,
        waitForConditionPollInterval: 10
      }
    },
    local: {
      launch_url: LOCAL_LAUNCH_URL,
      globals: {
        backend_url: LOCAL_BACKEND_URL,
        backend_admin_username: BACKEND_ADMIN_USERNAME,
        backend_admin_password: BACKEND_ADMIN_PASSWORD
      },
      webdriver: {
        start_process: true,
        server_path: chromedriver.path,
        port: 4445,
        cli_args: ['--port=4445']
      },
      screenshots : {
        enabled : true,
        path : "tests/reports/screenshots",
        on_failure: true
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: ['disable-gpu']
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
        start_process: false
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: ['disable-gpu']
        }
      }
    }
  }
}
