import { Store } from 'vuex'
interface Permission {
  description: string
  displayName: string
  id: string
  name: string
  permissionValue: {
    constraint: string
    operation: string
  }
  resource: {
    id: string
    type: string
  }
}
export enum RoleName {
  Admin = 'admin',
  SpaceAdmin = 'spaceadmin',
  User = 'user',
  Guest = 'guest'
}
interface Role {
  name: RoleName
  settings: Array<Permission>
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
    return this.user.role?.name === RoleName.Admin
  }

  public hasSpaceManagement() {
    return [RoleName.Admin, RoleName.SpaceAdmin].includes(this.user.role?.name)
  }

  public canEditSpaceQuota() {
    return !!this.user.role?.settings.find((s) => s.name === 'set-space-quota')
  }

  get user(): User {
    return this.store.getters.user
  }
}
