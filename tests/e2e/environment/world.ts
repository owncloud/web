import { config } from '../config'
import { environment } from '../support'
import { state } from './shared'

export class World {
  actorsEnvironment: environment.ActorsEnvironment
  filesEnvironment: environment.FilesEnvironment
  linksEnvironment: environment.LinksEnvironment
  spacesEnvironment: environment.SpacesEnvironment
  usersEnvironment: environment.UsersEnvironment

  constructor() {
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
}
