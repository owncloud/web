const withHttp = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

export const config = {
  ocis: process.env.OCIS === 'true',
  assets: './tests/acceptance/filesForUpload',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  headless: process.env.HEADLESS === 'true',
  acceptDownloads: process.env.DOWNLOADS !== 'false',
  browser: process.env.BROWSER ?? 'chrome',
  videoDir: process.env.VIDEO_DIR,
  harDir: process.env.HAR_DIR,
  tracingDir: process.env.TRACING_DIR,
  baseUrlOcc: process.env.BASE_URL_OCC ?? 'host.docker.internal:8080',
  baseUrlOCis: process.env.BASE_URL_OCIS ?? 'host.docker.internal:9200',
  get backendUrl(): string {
    return withHttp(
      process.env.BACKEND_HOST ||
        (this.ocis ? 'https://' + this.baseUrlOCis : 'http://' + this.baseUrlOcc)
    )
  },
  get frontendUrl(): string {
    return withHttp(
      process.env.SERVER_HOST ||
        (this.ocis
          ? 'https://' + this.baseUrlOCis
          : 'http://' + this.baseUrlOcc + '/index.php/apps/web/index.html')
    )
  }
}
