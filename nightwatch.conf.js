const chromedriver = require('chromedriver')
const localLaunchUrl = process.env.SERVER_HOST || 'http://localhost:8300'

module.exports = {
  page_objects_path: './tests/acceptance/pageObjects',
  test_settings: {
    "default": {
      "globals": {
        "waitForConditionTimeout": 10000
      }
    },
    local: {
      launch_url: localLaunchUrl,
      webdriver: {
        start_process: true,
        server_path: chromedriver.path,
        port: 4445,
        cli_args: ['--port=4445']
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
