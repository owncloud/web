import { SharePermission, SharePermissions } from './permission'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

export abstract class ShareRole {
  private readonly _name: string
  private readonly _folder: boolean
  private readonly _label: string
  private readonly _inlineLabel: string
  private readonly _longLabel: string
  private readonly _icon: string
  private readonly _permissions: SharePermission[]

  constructor(
    name: string,
    folder: boolean,
    label: string,
    inlineLabel: string,
    icon: string,
    permissions: SharePermission[],
    longLabel?: string
  ) {
    this._name = name
    this._folder = folder
    this._label = label
    this._inlineLabel = inlineLabel
    this._icon = icon
    this._permissions = permissions
    this._longLabel = longLabel || ''
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

  get longLabel(): string {
    return this._longLabel
  }

  get hasCustomPermissions(): boolean {
    return false
  }

  get icon(): string {
    return this._icon
  }

  public permissions(allowSharing: boolean): SharePermission[] {
    return this._permissions.filter((p: SharePermission) => {
      if (p === SharePermissions.share) {
        return allowSharing
      }
      return true
    })
  }

  public abstract description(allowSharing: boolean): string

  /**
   * Calculates a bitmask from this role combined with the additional permissions (optional).
   *
   * @param allowSharing {boolean} Asserts whether share permission of the role should be taken into account.
   */
  public bitmask(allowSharing: boolean): number {
    return SharePermissions.permissionsToBitmask(this.permissions(allowSharing))
  }

  /**
   * Checks if the given permission exists in the permissions of the role.
   *
   * @param permission {SharePermission} The permission to be checked
   * @param allowSharing {boolean} Asserts whether share permission of the role should be taken into account.
   */
  public hasPermission(permission: SharePermission, allowSharing = false): boolean {
    return this.permissions(allowSharing).filter((p) => p.bit === permission.bit).length > 0
  }
}

export class CustomShareRole extends ShareRole {
  get hasCustomPermissions(): boolean {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public description(allowSharing: boolean): string {
    return $gettext('Set custom permissions')
  }
}

export class PeopleShareRole extends ShareRole {
  public description(allowSharing: boolean): string {
    return shareRoleDescriptions[this.bitmask(allowSharing)]
  }
}

export class SpaceShareRole extends ShareRole {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public description(allowSharing: boolean): string {
    switch (this.name) {
      case spaceRoleViewer.name:
        return $gettext('View and download.')
      case spaceRoleEditor.name:
        return $gettext('View, download, upload, edit, add and delete.')
      case spaceRoleManager.name:
        return $gettext('View, download, upload, edit, add, delete, share and manage members.')
    }
  }
}

export class LinkShareRole extends ShareRole {
  public description(allowSharing: boolean): string {
    return linkRoleDescriptions[this.bitmask(allowSharing)]
  }
}

export const peopleRoleViewerFile = new PeopleShareRole(
  'viewer',
  false,
  $gettext('Can view'),
  $gettext('can view'),
  'eye',
  [SharePermissions.read, SharePermissions.share]
)
export const peopleRoleViewerFolder = new PeopleShareRole(
  'viewer',
  true,
  $gettext('Can view'),
  $gettext('can view'),
  'eye',
  [SharePermissions.read, SharePermissions.share]
)
export const peopleRoleEditorFile = new PeopleShareRole(
  'editor',
  false,
  $gettext('Can edit'),
  $gettext('can edit'),
  'pencil',
  [SharePermissions.read, SharePermissions.update, SharePermissions.share]
)
export const peopleRoleEditorFolder = new PeopleShareRole(
  'editor',
  true,
  $gettext('Can edit'),
  $gettext('can edit'),
  'pencil',
  [
    SharePermissions.read,
    SharePermissions.update,
    SharePermissions.create,
    SharePermissions.delete,
    SharePermissions.share
  ]
)
export const peopleRoleCustomFile = new CustomShareRole(
  'custom',
  false,
  $gettext('Custom permissions'),
  $gettext('custom permissions'),
  'settings-3',
  [SharePermissions.read, SharePermissions.update, SharePermissions.share]
)
export const peopleRoleCustomFolder = new CustomShareRole(
  'custom',
  true,
  $gettext('Custom permissions'),
  $gettext('custom permissions'),
  'settings-3',
  [
    SharePermissions.read,
    SharePermissions.update,
    SharePermissions.create,
    SharePermissions.delete,
    SharePermissions.share
  ]
)
export const peopleRoleDenyFolder = new PeopleShareRole(
  'denied',
  true,
  $gettext('No access'),
  $gettext('no access'),
  'user-unfollow',
  [SharePermissions.denied]
)
export const linkRoleInternalFile = new LinkShareRole(
  'internal',
  false,
  $gettext('Invited people'),
  $gettext('invited people'),
  'user',
  [SharePermissions.internal],
  $gettext('Only for invited people')
)
export const linkRoleInternalFolder = new LinkShareRole(
  'internal',
  true,
  $gettext('Invited people'),
  $gettext('invited people'),
  'user',
  [SharePermissions.internal],
  $gettext('Only for invited people')
)
export const linkRoleViewerFile = new LinkShareRole(
  'viewer',
  false,
  $gettext('Can view'),
  $gettext('can view'),
  'eye',
  [SharePermissions.read],
  $gettext('Anyone with the link can view')
)
export const linkRoleViewerFolder = new LinkShareRole(
  'viewer',
  true,
  $gettext('Can view'),
  $gettext('can view'),
  'eye',
  [SharePermissions.read],
  $gettext('Anyone with the link can view')
)
export const linkRoleContributorFolder = new LinkShareRole(
  'contributor',
  true,
  $gettext('Can upload'),
  $gettext('can upload'),
  'upload',
  [SharePermissions.read, SharePermissions.create],
  $gettext('Anyone with the link can upload')
)
export const linkRoleEditorFile = new LinkShareRole(
  'editor',
  false,
  $gettext('Can edit'),
  $gettext('can edit'),
  'pencil',
  [SharePermissions.read, SharePermissions.update],
  $gettext('Anyone with the link can edit')
)
export const linkRoleEditorFolder = new LinkShareRole(
  'editor',
  true,
  $gettext('Can edit'),
  $gettext('can edit'),
  'pencil',
  [
    SharePermissions.read,
    SharePermissions.update,
    SharePermissions.create,
    SharePermissions.delete
  ],
  $gettext('Anyone with the link can edit')
)
export const linkRoleUploaderFolder = new LinkShareRole(
  'uploader',
  true,
  $gettext('Secret File Drop'),
  $gettext('Secret File Drop'),
  'inbox-unarchive',
  [SharePermissions.create]
)
export const spaceRoleViewer = new SpaceShareRole(
  'viewer',
  false,
  $gettext('Can view'),
  $gettext('can view'),
  'eye',
  [SharePermissions.read]
)
export const spaceRoleEditor = new SpaceShareRole(
  'editor',
  false,
  $gettext('Can edit'),
  $gettext('can edit'),
  'pencil',
  [SharePermissions.read, SharePermissions.update, SharePermissions.create, SharePermissions.delete]
)
export const spaceRoleManager = new SpaceShareRole(
  'manager',
  false,
  $gettext('Can manage'),
  $gettext('can manage'),
  'user-star',
  [
    SharePermissions.read,
    SharePermissions.update,
    SharePermissions.create,
    SharePermissions.delete,
    SharePermissions.share
  ]
)

export abstract class SpacePeopleShareRoles {
  static readonly all = [spaceRoleViewer, spaceRoleEditor, spaceRoleManager]

  static list(): ShareRole[] {
    return this.all
  }

  static getByBitmask(bitmask: number): ShareRole {
    return this.all // Retrieve all possible options always, even if deny is not enabled
      .find((r) => r.bitmask(true) === bitmask)
  }
}

export abstract class PeopleShareRoles {
  static readonly all = [
    peopleRoleViewerFile,
    peopleRoleViewerFolder,
    peopleRoleEditorFile,
    peopleRoleEditorFolder
  ]

  static readonly allWithCustom = [...this.all, peopleRoleCustomFile, peopleRoleCustomFolder]

  static list(isFolder: boolean, hasCustom = true): ShareRole[] {
    return [...(hasCustom ? this.allWithCustom : this.all)].filter((r) => r.folder === isFolder)
  }

  static custom(isFolder: boolean): ShareRole {
    return this.allWithCustom.find((r) => r.folder === isFolder && r.hasCustomPermissions)
  }

  static getByBitmask(bitmask: number, isFolder: boolean, allowSharing: boolean): ShareRole {
    const role = [...this.allWithCustom, peopleRoleDenyFolder] // Retrieve all possible options always, even if deny is not enabled
      .filter((r) => !r.hasCustomPermissions)
      .find((r) => r.folder === isFolder && r.bitmask(allowSharing) === bitmask)
    return role || this.custom(isFolder)
  }

  /**
   * Filter all roles that have either exactly the permissions from the bitmask or a subset of them.
   * @param bitmask
   * @param isFolder
   * @param allowSharing
   * @param allowCustom
   */
  static filterByBitmask(
    bitmask: number,
    isFolder: boolean,
    allowSharing: boolean,
    allowCustom: boolean
  ): ShareRole[] {
    const roles = this.all.filter((r) => {
      return r.folder === isFolder && bitmask === (bitmask | r.bitmask(allowSharing))
    })

    if (allowCustom) {
      const customRoles = [peopleRoleCustomFile, peopleRoleCustomFolder]
      return [...roles, ...customRoles.filter((c) => c.folder === isFolder)]
    }

    return roles
  }
}

export abstract class LinkShareRoles {
  static list(
    isFolder: boolean,
    canEditFile = false,
    canContribute = false,
    hasAliasLinks = false,
    canCreatePublicLinks = true
  ): ShareRole[] {
    return [
      ...(hasAliasLinks ? [linkRoleInternalFile, linkRoleInternalFolder] : []),
      ...(canCreatePublicLinks ? [linkRoleViewerFile] : []),
      ...(canCreatePublicLinks ? [linkRoleViewerFolder] : []),
      ...(canCreatePublicLinks && canContribute ? [linkRoleContributorFolder] : []),
      ...(canCreatePublicLinks ? [linkRoleEditorFolder] : []),
      ...(canCreatePublicLinks ? [linkRoleUploaderFolder] : []),
      ...(canCreatePublicLinks && canEditFile ? [linkRoleEditorFile] : [])
    ].filter((r) => r.folder === isFolder)
  }

  static getByBitmask(bitmask: number, isFolder: boolean): ShareRole {
    return this.list(isFolder, true, true, true, true).find((r) => r.bitmask(false) === bitmask)
  }

  /**
   * Filter all roles that have either exactly the permissions from the bitmask or a subset of them.
   * @param bitmask
   * @param isFolder
   * @param canEditFile
   * @param canContribute
   * @param hasAliasLinks
   * @param canCreatePublicLinks
   */
  static filterByBitmask(
    bitmask: number,
    isFolder: boolean,
    canEditFile = false,
    canContribute = false,
    hasAliasLinks = false,
    canCreatePublicLinks = true
  ): ShareRole[] {
    return this.list(
      isFolder,
      canEditFile,
      canContribute,
      hasAliasLinks,
      canCreatePublicLinks
    ).filter((r) => {
      return bitmask === (bitmask | r.bitmask(false))
    })
  }

  static getByName(
    name: string,
    isFolder: boolean,
    canEditFile: boolean,
    canContribute: boolean,
    hasAliasLinks: boolean
  ): ShareRole {
    return LinkShareRoles.list(isFolder, canEditFile, canContribute, hasAliasLinks).find(
      (role) => role.name.toLowerCase() === name.toLowerCase()
    )
  }
}

/**
 * Maps relevant permission bitmasks of people roles to descriptions
 */
const shareRoleDescriptions = {
  [peopleRoleViewerFile.bitmask(false)]: $gettext('View and download.'),
  [peopleRoleViewerFile.bitmask(true)]: $gettext('View, download and share.'),
  [peopleRoleViewerFolder.bitmask(false)]: $gettext('View and download.'),
  [peopleRoleViewerFolder.bitmask(true)]: $gettext('View, download and share.'),
  [peopleRoleEditorFile.bitmask(false)]: $gettext('View, download, and edit.'),
  [peopleRoleEditorFile.bitmask(true)]: $gettext('View, download, edit and share file.'),
  [peopleRoleEditorFolder.bitmask(false)]: $gettext(
    'View, download, upload, edit, add and delete.'
  ),
  [peopleRoleEditorFolder.bitmask(true)]: $gettext(
    'View, download, upload, edit, add, delete and share.'
  ),
  [peopleRoleDenyFolder.bitmask(false)]: $gettext('Deny access')
}

/**
 * Maps relevant permission bitmasks of link roles to descriptions
 */
const linkRoleDescriptions = {
  [linkRoleInternalFile.bitmask(false)]: $gettext(
    'Link works only for invited people. Login is required.'
  ),
  [linkRoleInternalFolder.bitmask(false)]: $gettext(
    'Link works only for invited people. Login is required.'
  ),
  [linkRoleViewerFile.bitmask(false)]: $gettext('Anyone with the link can view and download.'),
  [linkRoleViewerFolder.bitmask(false)]: $gettext('Anyone with the link can view and download.'),
  [linkRoleContributorFolder.bitmask(false)]: $gettext(
    'Anyone with the link can view, download and upload.'
  ),
  [linkRoleEditorFile.bitmask(false)]: $gettext(
    'Anyone with the link can view, download and edit.'
  ),
  [linkRoleEditorFolder.bitmask(false)]: $gettext(
    'Anyone with the link can view, download, upload, edit, add and delete.'
  ),
  [linkRoleUploaderFolder.bitmask(false)]: $gettext(
    'Anyone with the link can only upload, existing content is not revealed.'
  )
}
