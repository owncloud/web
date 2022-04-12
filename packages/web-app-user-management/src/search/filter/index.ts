import { SearchProvider } from 'search/src/types'
import { EventBus } from 'web-pkg/src/event'
import VueRouter, { Route } from 'vue-router'

function $gettext(msg) {
  return msg
}

const kind = (currentRoute: Route): 'users' | 'groups' | undefined => {
  switch (currentRoute.name) {
    case 'user-management-users':
      return 'users'
    case 'user-management-groups':
      return 'groups'
    default:
      return undefined
  }
}

export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  private readonly router: VueRouter

  constructor(router: VueRouter) {
    super()

    this.id = 'usersManagement.filter'
    this.router = router
  }

  public get label(): string {
    return $gettext(`Search ${kind(this.router.currentRoute)} ↵`)
  }

  public activate(term: string): void {
    /* noop */
  }

  public reset(): void {
    /* noop */
  }

  public updateTerm(term: string): void {
    this.publish('updateTerm', { kind: kind(this.router.currentRoute), term })
  }

  public get available(): boolean {
    return !!kind(this.router.currentRoute)
  }
}
