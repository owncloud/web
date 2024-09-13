import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber'
import { Pickle } from '@cucumber/messages'
import { config } from '../../config'
import { environment } from '../../support'
import { state } from './shared'

interface WorldOptions extends IWorldOptions {
  parameters: { [key: string]: string }
}

export class World extends CucumberWorld {
  feature: Pickle
  actorsEnvironment: environment.ActorsEnvironment
  filesEnvironment: environment.FilesEnvironment
  linksEnvironment: environment.LinksEnvironment
  spacesEnvironment: environment.SpacesEnvironment
  usersEnvironment: environment.UsersEnvironment

  constructor(options: WorldOptions) {
    super(options)
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
        reportVideo: config.reportVideo
      },
      browser: state.browser
    })
  }
}
