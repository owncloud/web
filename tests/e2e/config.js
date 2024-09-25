const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

export const config = {
  // environment
  assets: './tests/e2e/filesForUpload',
  tempAssetsPath: './tests/e2e/filesForUpload/temp',
  baseUrlOcis: process.env.BASE_URL_OCIS ?? 'host.docker.internal:9200',
  basicAuth: process.env.BASIC_AUTH === 'true',
  // keycloak config
  keycloak: process.env.KEYCLOAK === 'true',
  keycloakHost: process.env.KEYCLOAK_HOST ?? 'keycloak.owncloud.test',
  keycloakRealm: process.env.KEYCLOAK_REALM ?? 'oCIS',
  keycloakAdminUser: process.env.KEYCLOAK_ADMIN_USER ?? 'admin',
  keycloakAdminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin',
  get backendUrl() {
    return withHttp(process.env.BACKEND_HOST || this.baseUrlOcis)
  },
  get frontendUrl() {
    return withHttp(process.env.SERVER_HOST || this.baseUrlOcis)
  },
  get keycloakUrl() {
    return withHttp(this.keycloakHost)
  },
  get keycloakLoginUrl() {
    return withHttp(this.keycloakHost + '/admin/master/console')
  },
  debug: process.env.DEBUG === 'true',
  logLevel: process.env.LOG_LEVEL || 'silent',
  // cucumber
  retry: process.env.RETRY || 0,
  // playwright
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  timeout: parseInt(process.env.TIMEOUT) || 60,
  minTimeout: parseInt(process.env.MIN_TIMEOUT) || 5,
  tokenTimeout: parseInt(process.env.TOKEN_TIMEOUT) || 40,
  headless: process.env.HEADLESS === 'true',
  acceptDownloads: process.env.DOWNLOADS !== 'false',
  trace: 'on-first-retry',
  browser: process.env.BROWSER ?? 'chrome',
  reportDir: process.env.REPORT_DIR || 'reports/e2e',
  get tracingReportDir() {
    return this.reportDir + '/playwright/tracing'
  },
  reportVideo: process.env.REPORT_VIDEO === 'true',
  reportHar: process.env.REPORT_HAR === 'true',
  reportTracing: process.env.REPORT_TRACING === 'true',
  failOnUncaughtConsoleError: process.env.FAIL_ON_UNCAUGHT_CONSOLE_ERR === 'true'
}
