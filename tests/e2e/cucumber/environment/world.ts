import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber'
import { Pickle } from '@cucumber/messages'
import { config } from '../../config'
import { ActorsEnvironment, UsersEnvironment, FilesEnvironment } from '../../support'
import { state } from './shared'

interface WorldOptions extends IWorldOptions {
  parameters: { [key: string]: string }
}

export class World extends CucumberWorld {
  feature: Pickle
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  filesEnvironment: FilesEnvironment

  constructor(options: WorldOptions) {
    super(options)
    this.usersEnvironment = new UsersEnvironment()
    this.filesEnvironment = new FilesEnvironment()
    this.actorsEnvironment = new ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        recordDir: config.recordDir,
        recordHar: config.recordHar,
        recordTracing: config.recordTracing,
        recordVideo: config.recordVideo
      },
      browser: state.browser
    })
  }
}
