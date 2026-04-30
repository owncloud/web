import { config } from '../../config'
import { environment } from '../index'
import { state } from '../../cucumber/environment/shared'

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
}