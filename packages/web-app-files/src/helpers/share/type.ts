import { intersection } from 'lodash-es'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

export class ShareType {
  private readonly _key: string
  private readonly _value: number
  private readonly _label: string

  constructor(key: string, value: number, label: string) {
    this._key = key
    this._value = value
    this._label = label
  }

  get key(): string {
    return this._key
  }

  get value(): number {
    return this._value
  }

  get label(): string {
    return this._label
  }
}

export abstract class ShareTypes {
  static readonly user = new ShareType('user', 0, $gettext('User'))
  static readonly group = new ShareType('group', 1, $gettext('Group'))
  static readonly link = new ShareType('link', 3, $gettext('Link'))
  static readonly guest = new ShareType('guest', 4, $gettext('Guest'))
  static readonly remote = new ShareType('remote', 6, $gettext('Federated'))
  static readonly space = new ShareType('space', 7, $gettext('User'))

  static readonly individuals = [this.user, this.guest, this.remote, this.space]
  static readonly collectives = [this.group]
  static readonly unauthenticated = [this.link]
  static readonly authenticated = [this.user, this.group, this.guest, this.remote, this.space]
  static readonly all = [this.user, this.group, this.link, this.guest, this.remote, this.space]

  static isIndividual(type: ShareType): boolean {
    return this.individuals.includes(type)
  }

  static isCollective(type: ShareType): boolean {
    return this.collectives.includes(type)
  }

  static isUnauthenticated(type: ShareType): boolean {
    return this.unauthenticated.includes(type)
  }

  static isAuthenticated(type: ShareType): boolean {
    return this.authenticated.includes(type)
  }

  static getByValue(value: number): ShareType {
    return this.all.find((type) => type.value === value)
  }

  static getValues(types: ShareType[]): number[] {
    return types.map((t) => t.value)
  }

  static containsAnyValue(types: ShareType[], values: number[]): boolean {
    return intersection(this.getValues(types), values).length > 0
  }
}
