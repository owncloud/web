const withHttp = url => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

export const config = {
  ocis: process.env.OCIS === 'true',
  assets: './tests/acceptance/filesForUpload',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER ?? 'chrome',
  get backendUrl(): string {
    return withHttp(
      process.env.BACKEND_HOST ||
        (this.ocis ? 'https://host.docker.internal:9200' : 'http://host.docker.internal:8080')
    )
  },
  get frontendUrl(): string {
    return withHttp(
      process.env.SERVER_HOST ||
        (this.ocis
          ? 'https://host.docker.internal:9200'
          : 'http://host.docker.internal:8080/index.php/apps/web/index.html')
    )
  }
}
