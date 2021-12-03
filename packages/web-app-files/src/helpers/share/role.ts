import { SharePermission, SharePermissions } from './permission'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

export class ShareRole {
  private readonly _name: string
  private readonly _folder: boolean
  private readonly _label: string
  private readonly _inlineLabel: string
  private readonly _permissions: SharePermission[]
  private readonly _description: string

  constructor(
    name: string,
    folder: boolean,
    label: string,
    inlineLabel: string,
    permissions: SharePermission[],
    description?: string
  ) {
    this._name = name
    this._folder = folder
    this._label = label
    this._inlineLabel = inlineLabel
    this._permissions = permissions
    this._description = description
  }

  get key(): string {
    return `${this._name}-${this._folder ? 'folder' : 'file'}`
  }

  get name(): string {
    return this._name
  }

  get folder(): boolean {
    return this._folder
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
    if (this._description) {
      return this._description
    }
    return shareRoleDescriptions[this.bitmask(allowSharing)]
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
  private static readonly peopleRoles = [
    new ShareRole('viewer', false, $gettext('Viewer'), $gettext('viewer'), [
      SharePermissions.read,
      SharePermissions.share
    ]),
    new ShareRole('viewer', true, $gettext('Viewer'), $gettext('viewer'), [
      SharePermissions.read,
      SharePermissions.share
    ]),
    new ShareRole('editor', false, $gettext('Editor'), $gettext('editor'), [
      SharePermissions.read,
      SharePermissions.update,
      SharePermissions.share
    ]),
    new ShareRole('editor', true, $gettext('Editor'), $gettext('editor'), [
      SharePermissions.read,
      SharePermissions.update,
      SharePermissions.create,
      SharePermissions.delete,
      SharePermissions.share
    ]),
    new CustomShareRole(
      'custom',
      false,
      $gettext('Custom permissions'),
      $gettext('custom permissions'),
      [SharePermissions.read, SharePermissions.update, SharePermissions.share]
    ),
    new CustomShareRole(
      'custom',
      true,
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
  ]

  private static readonly linkRoles = [
    new ShareRole('viewer', false, $gettext('Viewer'), $gettext('viewer'), [SharePermissions.read]),

  ]

  static listPeopleRoles(isFolder: boolean): ShareRole[] {
    return this.peopleRoles.filter((r) => r.folder === isFolder)
  }

  static customPeopleRole(isFolder: boolean): ShareRole {
    return this.peopleRoles.find((r) => r.folder === isFolder)
  }

  static listLinkRoles(isFolder: boolean): ShareRole[] {
    return this.linkRoles.filter((r) => r.folder === isFolder)
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
const shareRoleDescriptions = {
  []: $gettext('Download and preview'),
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

const linkRoleDescriptions = {}
