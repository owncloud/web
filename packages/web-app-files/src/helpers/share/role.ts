import { SharePermission, SharePermissions } from './permission'
import { RuntimeError } from 'web-runtime/src/container/error'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

export class ShareRole {
  private readonly _key: string
  private readonly _name: string
  private readonly _label: string
  private readonly _inlineLabel: string
  private readonly _permissions: SharePermission[]

  constructor(
    key: string,
    name: string,
    label: string,
    inlineLabel: string,
    permissions: SharePermission[]
  ) {
    this._key = key
    this._name = name
    this._label = label
    this._inlineLabel = inlineLabel
    this._permissions = permissions
  }

  get key(): string {
    return this._key
  }

  get name(): string {
    return this._name
  }

  get label(): string {
    return this._label
  }

  get inlineLabel(): string {
    return this._inlineLabel
  }

  get customPermissions(): boolean {
    return false
  }

  public permissions(allowSharing: boolean): SharePermission[] {
    return this._permissions.filter((p: SharePermission) => {
      if (p === SharePermissions.share) {
        return allowSharing
      }
      return true
    })
  }

  public description(allowSharing: boolean): string {
    return roleDescriptions[this.bitmask(allowSharing)]
  }

  /**
   * Calculates a bitmask from this role combined with the additional permissions (optional).
   *
   * @param allowSharing {boolean} Asserts whether share permission of the role should be taken into account.
   */
  public bitmask(allowSharing: boolean): number {
    return SharePermissions.permissionsToBitmask(this.permissions(allowSharing))
  }
}

class CustomShareRole extends ShareRole {
  get customPermissions(): boolean {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public description(allowSharing: boolean): string {
    return $gettext('Set detailed permissions')
  }
}

export abstract class ShareRoles {
  static readonly viewerFile = new ShareRole(
    'viewerFile',
    'viewer',
    $gettext('Viewer'),
    $gettext('viewer'),
    [SharePermissions.read, SharePermissions.share]
  )

  static readonly viewerFolder = new ShareRole(
    'viewerFolder',
    'viewer',
    $gettext('Viewer'),
    $gettext('viewer'),
    [SharePermissions.read, SharePermissions.share]
  )

  static readonly editorFile = new ShareRole(
    'editorFile',
    'editor',
    $gettext('Editor'),
    $gettext('editor'),
    [SharePermissions.read, SharePermissions.update, SharePermissions.share]
  )

  static readonly editorFolder = new ShareRole(
    'editorFolder',
    'editor',
    $gettext('Editor'),
    $gettext('editor'),
    [
      SharePermissions.read,
      SharePermissions.update,
      SharePermissions.create,
      SharePermissions.delete,
      SharePermissions.share
    ]
  )

  static readonly customFile = new CustomShareRole(
    'customFile',
    'custom',
    $gettext('Custom permissions'),
    $gettext('custom permissions'),
    [SharePermissions.read, SharePermissions.update, SharePermissions.share]
  )

  static readonly customFolder = new CustomShareRole(
    'customFolder',
    'custom',
    $gettext('Custom permissions'),
    $gettext('custom permissions'),
    [
      SharePermissions.read,
      SharePermissions.update,
      SharePermissions.create,
      SharePermissions.delete,
      SharePermissions.share
    ]
  )

  static list(isFolder: boolean): ShareRole[] {
    if (isFolder) {
      return [this.viewerFolder, this.editorFolder, this.customFolder]
    }
    return [this.viewerFile, this.editorFile, this.customFile]
  }

  static getByName(name: string, isFolder: boolean): ShareRole {
    const r = this.list(isFolder).find((r) => r.name === name)
    if (!r) {
      throw new RuntimeError(`ShareRole ${name} not found`)
    }
    return r
  }

  static getByPermissions(
    permissions: SharePermission[],
    isFolder: boolean,
    allowSharing: boolean
  ): ShareRole {
    const bitmask = SharePermissions.permissionsToBitmask(permissions)
    return this.getByBitmask(bitmask, isFolder, allowSharing)
  }

  static getByBitmask(bitmask: number, isFolder: boolean, allowSharing: boolean): ShareRole {
    if (isFolder) {
      switch (bitmask) {
        case ShareRoles.viewerFolder.bitmask(allowSharing):
          return ShareRoles.viewerFolder
        case ShareRoles.editorFolder.bitmask(allowSharing):
          return ShareRoles.editorFolder
        default:
          return ShareRoles.customFolder
      }
    }
    switch (bitmask) {
      case ShareRoles.viewerFile.bitmask(allowSharing):
        return ShareRoles.viewerFile
      case ShareRoles.editorFile.bitmask(allowSharing):
        return ShareRoles.editorFile
      default:
        return ShareRoles.customFile
    }
  }
}

/**
 * Maps relevant permission bitmasks to descriptions
 */
const roleDescriptions = {
  [ShareRoles.viewerFile.bitmask(false)]: $gettext('Download and preview'),
  [ShareRoles.viewerFile.bitmask(true)]: $gettext('Download, preview and share'),
  [ShareRoles.viewerFolder.bitmask(false)]: $gettext('Download and preview'),
  [ShareRoles.viewerFolder.bitmask(true)]: $gettext('Download, preview and share'),
  [ShareRoles.editorFile.bitmask(false)]: $gettext('Edit, download and preview'),
  [ShareRoles.editorFile.bitmask(true)]: $gettext('Edit, download, preview and share'),
  [ShareRoles.editorFolder.bitmask(false)]: $gettext('Upload, edit, delete, download and preview'),
  [ShareRoles.editorFolder.bitmask(true)]: $gettext(
    'Upload, edit, delete, download, preview and share'
  )
}
