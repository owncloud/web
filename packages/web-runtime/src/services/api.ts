import { Store } from 'vuex'

export class Api {
  private readonly store: Store<any>

  constructor(store: Store<any>) {
    this.store = store
  }

  public registerExtension(app: string, extension: { [key: string]: any }): void {
    console.log('#############################################################################')
    console.log('# FROM THE API (RUNTIME)')
    console.log(`# app '${app}', requested to register a new extension...`)
    console.log('#############################################################################')

    this.store.commit('REGISTER_EXTENSION', { app, extension })
  }
}
