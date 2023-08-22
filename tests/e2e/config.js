const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

exports.config = {
  // environment
  keycloak: process.env.KEYCLOAK === 'true',
  assets: './tests/e2e/filesForUpload',
  tempAssetsPath: './tests/e2e/filesForUpload/temp',
  baseUrlOcis: process.env.BASE_URL_OCIS ?? 'host.docker.internal:9200',
  apiToken: process.env.API_TOKEN === 'true',
  get backendUrl() {
    return withHttp(process.env.BACKEND_HOST || this.baseUrlOcis)
  },
  get frontendUrl() {
    return withHttp(process.env.SERVER_HOST || this.baseUrlOcis)
  },
  debug: process.env.DEBUG === 'true',
  logLevel: process.env.LOG_LEVEL || 'silent',
  // cucumber
  retry: process.env.RETRY || 0,
  // playwright
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  timeout: parseInt(process.env.TIMEOUT) || 60,
  headless: process.env.HEADLESS === 'true',
  acceptDownloads: process.env.DOWNLOADS !== 'false',
  browser: process.env.BROWSER ?? 'chrome',
  reportDir: process.env.REPORT_DIR || 'reports/e2e',
  reportVideo: process.env.REPORT_VIDEO === 'true',
  reportHar: process.env.REPORT_HAR === 'true',
  reportTracing: process.env.REPORT_TRACING === 'true'
}
