interface Role {
  name: 'admin' | 'spaceadmin' | 'user' | 'guest'
}
interface User {
  role: Role
}

export class PermissionManagerService {
  private readonly user: User

  constructor(user: User) {
    this.user = user
  }

  public hasUserManagement() {
    return this.user.role.name === 'admin'
  }

  public hasSpaceManagement() {
    return ['admin', 'spaceadmin'].includes(this.user.role.name)
  }
}
