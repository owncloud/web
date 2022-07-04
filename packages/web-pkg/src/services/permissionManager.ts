import { Store } from 'vuex'
interface Role {
  name: 'admin' | 'spaceadmin' | 'user' | 'guest'
}
interface User {
  role: Role
}

export class PermissionManager {
  private readonly store: Store<any>

  constructor(store: Store<any>) {
    this.store = store
  }

  public hasUserManagement() {
    return this.user.role?.name === 'admin'
  }

  public hasSpaceManagement() {
    return ['admin', 'spaceadmin'].includes(this.user.role?.name)
  }

  get user(): User {
    return this.store.getters.user
  }
}
