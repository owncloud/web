import { config } from '../config'
import { environment } from '../support'
import { state } from './shared'

export class World {
  workerIndex: number
  testId: string
  private idCache = new Map<string, string>()

  actorsEnvironment: environment.ActorsEnvironment
  filesEnvironment: environment.FilesEnvironment
  linksEnvironment: environment.LinksEnvironment
  spacesEnvironment: environment.SpacesEnvironment
  usersEnvironment: environment.UsersEnvironment

  constructor(workerIndex: number = 0, testId: string = '') {
    this.workerIndex = workerIndex
    this.testId = testId

    this.usersEnvironment = new environment.UsersEnvironment()
    this.spacesEnvironment = new environment.SpacesEnvironment()
    this.filesEnvironment = new environment.FilesEnvironment()
    this.linksEnvironment = new environment.LinksEnvironment()
    this.actorsEnvironment = new environment.ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        reportDir: config.reportDir,
        tracingReportDir: config.tracingReportDir,
        reportHar: config.reportHar,
        reportTracing: config.reportTracing,
        reportVideo: config.reportVideo,
        failOnUncaughtConsoleError: config.failOnUncaughtConsoleError
      },
      browser: state.browser
    })
  }

  private generateId(base: string): string {
    return `${base}-w${this.workerIndex}-${this.testId}`
  }

  getGroupId(key: string): string {
    const cacheKey = `group:${key}`

    if (!this.idCache.has(cacheKey)) {
      this.idCache.set(cacheKey, this.generateId(key))
    }

    return this.idCache.get(cacheKey)!
  }

  getUserId(key: string): string {
    const cacheKey = `user:${key}`

    if (!this.idCache.has(cacheKey)) {
      this.idCache.set(cacheKey, this.generateId(key))
    }

    return this.idCache.get(cacheKey)!
  }

  /**
   * Transform resource name for parallel test safety.
   * Transforms: testfile.txt -> testfile-w1.txt (only when workerIndex > 0)
   */
  getResourceId(key: string): string {
    if (this.workerIndex === 0) {
      return key
    }

    const cacheKey = `resource:${key}`

    if (!this.idCache.has(cacheKey)) {
      const parts = key.split('/')
      const fileName = parts[parts.length - 1]
      const dir = parts.slice(0, -1).join('/')
      const newFileName = fileName.includes('.')
        ? fileName.replace(/(\.[^.]+)$/, `-w${this.workerIndex}$1`)
        : `${fileName}-w${this.workerIndex}`
      const transformed = dir ? `${dir}/${newFileName}` : newFileName
      this.idCache.set(cacheKey, transformed)
    }

    return this.idCache.get(cacheKey)!
  }
}
