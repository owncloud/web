const chromedriver = require('chromedriver')
const path = require('path')
const withHttp = url => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

const RUN_WITH_LDAP = !!process.env.RUN_WITH_LDAP
const RUN_ON_OCIS = !!process.env.RUN_ON_OCIS
const LOCAL_LAUNCH_URL = withHttp(
  process.env.SERVER_HOST || (RUN_ON_OCIS ? 'https://localhost:9200' : 'http://localhost:8300')
)
const LOCAL_BACKEND_URL = withHttp(
  process.env.BACKEND_HOST || (RUN_ON_OCIS ? 'https://localhost:9200' : 'http://localhost:8080')
)
const REMOTE_BACKEND_URL = process.env.REMOTE_BACKEND_HOST
  ? withHttp(process.env.REMOTE_BACKEND_HOST || 'http://localhost:8080')
  : undefined
const BACKEND_ADMIN_USERNAME = process.env.BACKEND_USERNAME || 'admin'
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_PASSWORD || 'admin'
const SELENIUM_HOST = process.env.SELENIUM_HOST || 'localhost'
const SELENIUM_PORT = process.env.SELENIUM_PORT || 4444
const REMOTE_UPLOAD_DIR =
  process.env.REMOTE_UPLOAD_DIR ||
  require('path').join(__dirname, '/tests/acceptance/filesForUpload/')
const SAUCE_USERNAME = process.env.SAUCE_USERNAME
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY
const BROWSER_NAME = process.env.BROWSER_NAME
const SAUCELABS_TUNNEL_NAME = process.env.SAUCELABS_TUNNEL_NAME
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || '/uploads'
const OCIS_REVA_DATA_ROOT = process.env.OCIS_REVA_DATA_ROOT || '/var/tmp/ocis/owncloud'
const LDAP_SERVER_URL = process.env.LDAP_SERVER_URL || 'ldap://127.0.0.1'
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'cn=admin,dc=owncloud,dc=com'
const LDAP_ADMIN_PASSWORD = process.env.LDAP_ADMIN_PASSWORD || 'admin'
const OCIS_SKELETON_DIR = process.env.OCIS_SKELETON_DIR || './tests/testing-app/data/webUISkeleton/'
const OPENID_LOGIN = RUN_ON_OCIS || !!process.env.OPENID_LOGIN
const PHOENIX_CONFIG = process.env.PHOENIX_CONFIG || path.join(__dirname, 'dist/config.json')
const SCREENSHOTS = !!process.env.SCREENSHOTS

module.exports = {
  page_objects_path: './tests/acceptance/pageObjects',
  custom_commands_path: './tests/acceptance/customCommands',
  test_settings: {
    default: {
      launch_url: LOCAL_LAUNCH_URL,
      globals: {
        waitForConditionTimeout: 20000,
        waitForConditionPollInterval: 10,
        filesForUpload: REMOTE_UPLOAD_DIR,
        mountedUploadDir: LOCAL_UPLOAD_DIR,
        backend_url: LOCAL_BACKEND_URL,
        remote_backend_url: REMOTE_BACKEND_URL,
        backend_admin_username: BACKEND_ADMIN_USERNAME,
        backend_admin_password: BACKEND_ADMIN_PASSWORD,
        default_backend: 'LOCAL',
        ocis: RUN_ON_OCIS,
        ldap: RUN_WITH_LDAP,
        openid_login: OPENID_LOGIN,
        ldap_url: LDAP_SERVER_URL,
        ocis_data_dir: OCIS_REVA_DATA_ROOT,
        ldap_base_dn: LDAP_BASE_DN,
        ocis_skeleton_dir: OCIS_SKELETON_DIR,
        ldap_password: LDAP_ADMIN_PASSWORD,
        phoenix_config: PHOENIX_CONFIG
      },
      selenium_host: SELENIUM_HOST,
      desiredCapabilities: {
        browserName: BROWSER_NAME || 'chrome',
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
      },
      screenshots: {
        enabled: SCREENSHOTS,
        path: 'tests/reports/screenshots',
        on_failure: true
      }
    },
    saucelabs: {
      desiredCapabilities: {
        tunnelIdentifier: SAUCELABS_TUNNEL_NAME,
        screenResolution: '1280x1024',
        username: SAUCE_USERNAME,
        access_key: SAUCE_ACCESS_KEY,
        idleTimeout: 180
      }
    }
  }
}
