const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

exports.config = {
  // environment
  ocis: process.env.OCIS === 'true',
  assets: process.env.REMOTE_UPLOAD_DIR ?? './tests/acceptance/filesForUpload',
  baseUrlOcc: process.env.BASE_URL_OCC ?? 'host.docker.internal:8080',
  baseUrlOCis: process.env.BASE_URL_OCIS ?? 'host.docker.internal:9200',
  baseUrlMiddleware:
    process.env.MIDDLEWARE_HOST ??
    (this.ocis ? 'http://host.docker.internal:3000' : 'http://host.docker.internal:3001'),
  get backendUrl() {
    return withHttp(
      process.env.BACKEND_HOST ||
        (this.ocis ? 'https://' + this.baseUrlOCis : 'http://' + this.baseUrlOcc)
    )
  },
  get frontendUrl() {
    return withHttp(
      process.env.SERVER_HOST ||
        (this.ocis
          ? 'https://' + this.baseUrlOCis
          : 'http://' + this.baseUrlOcc + '/index.php/apps/web/index.html')
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
