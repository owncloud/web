/**
 * World class for parallel test support.
 *
 * WHY THIS FILE EXISTS:
 * This file is needed because e2e support files (userManagement.ts, space.ts, etc.)
 * need access to World for parallel test ID transformation. TypeScript cannot import
 * from e2e-playwright folder due to separate tsconfig - hence World is here in e2e.
 *
 * TODO: When e2e folder is deleted (after gherkin migration):
 * 1. Copy this file to tests/e2e-playwright/support/world.ts
 * 2. Update all imports in e2e-playwright to use local World:
 *    - tests/e2e-playwright/steps/api/api.ts
 *    - tests/e2e-playwright/steps/ui/spaces.ts
 *    - tests/e2e-playwright/steps/ui/shares.ts
 *    - tests/e2e-playwright/steps/ui/links.ts
 *    - tests/e2e-playwright/steps/ui/session.ts
 *    - tests/e2e/support/objects/app-files/spaces/index.ts
 *    - tests/e2e/support/objects/app-files/trashbin/index.ts
 *    - tests/e2e/support/objects/app-admin-settings/spaces/index.ts
 *    - tests/e2e/support/api/graph/userManagement.ts
 * 3. Delete this file
 */

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

  /**
   * Transform resource name for parallel test safety
   * Transforms: testfile.txt -> testfile-w0.txt (only when workerIndex > 0)
   */
  getResourceId(key: string): string {
    // Only transform when running in parallel (workerIndex > 0)
    if (this.workerIndex === 0) {
      return key
    }

    const cacheKey = `resource:${key}`

    if (!this.idCache.has(cacheKey)) {
      // Add worker index to filename to avoid collisions
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
