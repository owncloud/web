import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber'
import { Pickle } from '@cucumber/messages'
import { ActorContinent } from './actor'
import { UserContinent } from './user'
import { FileContinent } from './file'

interface WorldOptions extends IWorldOptions {
  parameters: { [key: string]: string }
}

export class World extends CucumberWorld {
  feature: Pickle
  actorContinent: ActorContinent
  userContinent: UserContinent
  fileContinent: FileContinent

  constructor(options: WorldOptions) {
    super(options)
    this.actorContinent = new ActorContinent()
    this.userContinent = new UserContinent()
    this.fileContinent = new FileContinent()
  }
}
