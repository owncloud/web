const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

exports.config = {
  // environment
  ocis: process.env.OCIS === 'true',
  assets: './tests/e2e/filesForUpload',
  baseUrlOc10: process.env.BASE_URL_OCC ?? 'host.docker.internal:8080',
  baseUrlOcis: process.env.BASE_URL_OCIS ?? 'host.docker.internal:9200',
  get backendUrl() {
    return withHttp(
      process.env.BACKEND_HOST ||
        (this.ocis ? 'https://' + this.baseUrlOcis : 'http://' + this.baseUrlOc10)
    )
  },
  get frontendUrl() {
    return withHttp(
      process.env.SERVER_HOST ||
        (this.ocis
          ? 'https://' + this.baseUrlOcis
          : 'http://' + this.baseUrlOc10 + '/index.php/apps/web/index.html')
    )
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
