import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber'
import { Pickle } from '@cucumber/messages'
import { config } from '../../config'
import { ActorEnvironment, UserEnvironment, FileEnvironment } from '../../support'
import { state } from './shared'

interface WorldOptions extends IWorldOptions {
  parameters: { [key: string]: string }
}

export class World extends CucumberWorld {
  feature: Pickle
  actorContinent: ActorEnvironment
  userContinent: UserEnvironment
  fileContinent: FileEnvironment

  constructor(options: WorldOptions) {
    super(options)
    this.userContinent = new UserEnvironment()
    this.fileContinent = new FileEnvironment()
    this.actorContinent = new ActorEnvironment({
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
