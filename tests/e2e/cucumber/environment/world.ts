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
  usersEnvironment: environment.UsersEnvironment
  filesEnvironment: environment.FilesEnvironment
  linksEnvironment: environment.LinkEnvironment

  constructor(options: WorldOptions) {
    super(options)
    this.usersEnvironment = new environment.UsersEnvironment()
    this.filesEnvironment = new environment.FilesEnvironment()
    this.linksEnvironment = new environment.LinkEnvironment()
    this.actorsEnvironment = new environment.ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        reportDir: config.reportDir,
        reportHar: config.reportHar,
        reportTracing: config.reportTracing,
        reportVideo: config.reportVideo
      },
      browser: state.browser
    })
  }
}
