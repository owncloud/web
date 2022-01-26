// dummy to trick gettext string extraction into recognizing strings
import { SharePermissionBit } from 'web-pkg/src/constants'

const $gettext = (str) => {
  return str
}

export class SharePermission {
  private readonly _key: string
  private readonly _bit: number
  private readonly _label: string

  constructor(key: string, bit: number, label: string) {
    this._key = key
    this._bit = bit
    this._label = label
  }

  get key(): string {
    return this._key
  }

  get bit(): number {
    return this._bit
  }

  get label(): string {
    return this._label
  }

  public enabled(bitmask: number): boolean {
    return (bitmask & this.bit) > 0
  }
}

export abstract class SharePermissions {
  static readonly read = new SharePermission('read', SharePermissionBit.Read, $gettext('Read'))
  static readonly update = new SharePermission(
    'update',
    SharePermissionBit.Update,
    $gettext('Update')
  )

  static readonly create = new SharePermission(
    'create',
    SharePermissionBit.Create,
    $gettext('Create')
  )

  static readonly delete = new SharePermission(
    'delete',
    SharePermissionBit.Delete,
    $gettext('Delete')
  )

  static readonly share = new SharePermission('share', SharePermissionBit.Share, $gettext('Share'))

  static readonly deny = new SharePermission('deny', SharePermissionBit.Deny, $gettext('Deny'))

  static permissionsToBitmask(permissions: SharePermission[]): number {
    return (permissions || []).reduce((b: number, p: SharePermission) => b | p.bit, 0)
  }

  static bitmaskToPermissions(bitmask: number): SharePermission[] {
    return [this.read, this.update, this.create, this.delete, this.share].reduce(
      (a: SharePermission[], p: SharePermission) => {
        if (p.enabled(bitmask)) {
          a.push(p)
        }
        return a
      },
      []
    )
  }
}
