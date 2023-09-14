const chromedriver = require('chromedriver')
const path = require('path')
const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

const RUN_WITH_LDAP = process.env.RUN_WITH_LDAP === 'true'
const LOCAL_LAUNCH_URL = withHttp(process.env.SERVER_HOST || 'https://host.docker.internal:9200')
const LOCAL_BACKEND_URL = withHttp(process.env.BACKEND_HOST || 'https://host.docker.internal:9200')
const REMOTE_BACKEND_URL = process.env.REMOTE_BACKEND_HOST
  ? withHttp(process.env.REMOTE_BACKEND_HOST || 'http://localhost:8080')
  : undefined
const BACKEND_ADMIN_USERNAME = process.env.BACKEND_USERNAME || 'admin'
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_PASSWORD || 'admin'
const SELENIUM_HOST = process.env.SELENIUM_HOST || 'localhost'
const SELENIUM_PORT = process.env.SELENIUM_PORT || 4444
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || '/uploads'
const OCIS_REVA_DATA_ROOT = process.env.OCIS_REVA_DATA_ROOT || '/var/tmp/ocis/storage/owncloud'
const LDAP_SERVER_URL = process.env.LDAP_SERVER_URL || 'ldap://127.0.0.1'
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'cn=admin,dc=owncloud,dc=com'
const LDAP_ADMIN_PASSWORD = process.env.LDAP_ADMIN_PASSWORD || 'admin'
const TESTING_DATA_DIR = process.env.TESTING_DATA_DIR || './tests/testing-app/data/'
const OPENID_LOGIN = 'true'
const WEB_UI_CONFIG_FILE =
  process.env.WEB_UI_CONFIG_FILE || path.join(__dirname, 'dist/config.json')
const SCREENSHOTS = process.env.SCREENSHOTS === 'true'

const MIDDLEWARE_HOST = withHttp(process.env.MIDDLEWARE_HOST || 'http://host.docker.internal:3000')

const config = {
  page_objects_path: './pageObjects',
  custom_commands_path: ['./customCommands'],
  test_settings: {
    default: {
      // ocis doesn't have '#' in the url path anymore
      launch_url: LOCAL_LAUNCH_URL,
      globals: {
        waitForConditionTimeout: 10000,
        waitForNegativeConditionTimeout: 300,
        waitForConditionPollInterval: 10,
        mountedUploadDir: LOCAL_UPLOAD_DIR,
        backend_url: LOCAL_BACKEND_URL,
        remote_backend_url: REMOTE_BACKEND_URL,
        backend_admin_username: BACKEND_ADMIN_USERNAME,
        backend_admin_password: BACKEND_ADMIN_PASSWORD,
        default_backend: 'LOCAL',
        ocis: 'true',
        ldap: RUN_WITH_LDAP,
        openid_login: OPENID_LOGIN,
        ldap_url: LDAP_SERVER_URL,
        ocis_data_dir: OCIS_REVA_DATA_ROOT,
        ldap_base_dn: LDAP_BASE_DN,
        testing_data_dir: TESTING_DATA_DIR,
        ldap_password: LDAP_ADMIN_PASSWORD,
        webUIConfig: WEB_UI_CONFIG_FILE,
        screenshots: SCREENSHOTS,
        middlewareUrl: MIDDLEWARE_HOST
      },
      selenium_host: SELENIUM_HOST,
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: ['disable-gpu', 'ignore-certificate-errors'],
          w3c: false
        },
        loggingPrefs: { browser: 'ALL' }
      },
      webdriver: {
        start_process: false,
        port: SELENIUM_PORT,
        use_legacy_jsonwire: false
      }
    },
    local: {
      globals: {
        waitForConditionTimeout: 10000
      },
      webdriver: {
        start_process: false,
        server_path: chromedriver.path,
        cli_args: ['--port=' + SELENIUM_PORT]
      }
    },
    drone: {
      selenium_host: 'selenium',
      desiredCapabilities: {
        chromeOptions: {
          args: ['disable-gpu', 'disable-dev-shm-usage', 'ignore-certificate-errors'],
          w3c: false
        },
        idleTimeout: 180
      }
    }
  }
}

module.exports = config
