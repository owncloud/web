import {
  linkRoleContributorFolder,
  linkRoleEditorFolder,
  linkRoleUploaderFolder,
  linkRoleViewerFile,
  linkRoleViewerFolder,
  LinkShareRoles,
  peopleRoleCustomFile,
  peopleRoleCustomFolder,
  peopleRoleEditorFile,
  peopleRoleEditorFolder,
  peopleRoleViewerFile,
  peopleRoleViewerFolder,
  PeopleShareRole,
  PeopleShareRoles,
  SharePermissions
} from '../../../../src/helpers/share'

describe('ShareRole', () => {
  describe('permissions', () => {
    it('returns full permissions of a role that has no share permission', () => {
      const permissions = [SharePermissions.read, SharePermissions.update]
      const role = new PeopleShareRole('', true, '', '', permissions)
      expect(role.permissions(false)).toEqual(permissions)
      expect(role.permissions(true)).toEqual(permissions)
    })
    it.each([
      [
        'allowed',
        {
          permissions: [SharePermissions.read, SharePermissions.update, SharePermissions.share],
          allowSharing: true,
          result: [SharePermissions.read, SharePermissions.update, SharePermissions.share]
        }
      ],
      [
        'not allowed',
        {
          permissions: [SharePermissions.read, SharePermissions.update, SharePermissions.share],
          allowSharing: false,
          result: [SharePermissions.read, SharePermissions.update]
        }
      ]
    ])(
      'respects that re-sharing is %s for a role that has share permissions',
      (name, { permissions, allowSharing, result }) => {
        const role = new PeopleShareRole('', true, '', '', permissions)
        expect(role.permissions(allowSharing)).toEqual(result)
      }
    )
  })
})

describe('PeopleShareRoles', () => {
  describe('list', () => {
    it.each([
      [
        'all folder related share roles',
        {
          folder: true,
          result: PeopleShareRoles.all.filter((r) => r.folder === true)
        }
      ],
      [
        'all file related share roles',
        {
          folder: false,
          result: PeopleShareRoles.all.filter((r) => r.folder === false)
        }
      ]
    ])('%s', (name: string, { folder, result }) => {
      expect(PeopleShareRoles.list(folder)).toEqual(result)
    })
  })
  describe('custom', () => {
    it.each([
      [
        'custom role for folders',
        {
          folder: true,
          role: peopleRoleCustomFolder
        }
      ],
      [
        'custom role for files',
        {
          folder: false,
          role: peopleRoleCustomFile
        }
      ]
    ])('%s', (name: string, { folder, role }) => {
      expect(PeopleShareRoles.custom(folder)).toBe(role)
    })
  })
  describe('getByBitmask', () => {
    it.each([
      [
        'viewer role for folders with re-sharing',
        {
          bitmask: peopleRoleViewerFolder.bitmask(true),
          folder: true,
          allowSharing: true,
          role: peopleRoleViewerFolder
        }
      ],
      [
        'viewer role for folders without re-sharing',
        {
          bitmask: peopleRoleViewerFolder.bitmask(false),
          folder: true,
          allowSharing: false,
          role: peopleRoleViewerFolder
        }
      ],
      [
        'viewer role for files with re-sharing',
        {
          bitmask: peopleRoleViewerFile.bitmask(true),
          folder: false,
          allowSharing: true,
          role: peopleRoleViewerFile
        }
      ],
      [
        'viewer role for files without re-sharing',
        {
          bitmask: peopleRoleViewerFile.bitmask(false),
          folder: false,
          allowSharing: false,
          role: peopleRoleViewerFile
        }
      ],
      [
        'editor role for folders with re-sharing',
        {
          bitmask: peopleRoleEditorFolder.bitmask(true),
          folder: true,
          allowSharing: true,
          role: peopleRoleEditorFolder
        }
      ],
      [
        'editor role for folders without re-sharing',
        {
          bitmask: peopleRoleEditorFolder.bitmask(false),
          folder: true,
          allowSharing: false,
          role: peopleRoleEditorFolder
        }
      ],
      [
        'editor role for files with re-sharing',
        {
          bitmask: peopleRoleEditorFile.bitmask(true),
          folder: false,
          allowSharing: true,
          role: peopleRoleEditorFile
        }
      ],
      [
        'editor role for files without re-sharing',
        {
          bitmask: peopleRoleEditorFile.bitmask(false),
          folder: false,
          allowSharing: false,
          role: peopleRoleEditorFile
        }
      ],
      [
        'custom role for folders with re-sharing as fallback for non-existent bitmask',
        {
          bitmask: 1234567,
          folder: true,
          allowSharing: true,
          role: peopleRoleCustomFolder
        }
      ],
      [
        'custom role for folders without re-sharing as fallback for non-existent bitmask',
        {
          bitmask: 1234567,
          folder: true,
          allowSharing: false,
          role: peopleRoleCustomFolder
        }
      ],
      [
        'custom role for files with re-sharing as fallback for non-existent bitmask',
        {
          bitmask: 1234567,
          folder: false,
          allowSharing: true,
          role: peopleRoleCustomFile
        }
      ],
      [
        'custom role for files without re-sharing as fallback for non-existent bitmask',
        {
          bitmask: 1234567,
          folder: false,
          allowSharing: false,
          role: peopleRoleCustomFile
        }
      ]
    ])(
      'identifies correct role with %s',
      (name: string, { bitmask, folder, allowSharing, role }) => {
        expect(PeopleShareRoles.getByBitmask(bitmask, folder, allowSharing)).toBe(role)
      }
    )
  })
})

describe('LinkShareRoles', () => {
  describe('list', () => {
    it.each([
      [
        'all folder related share roles',
        {
          folder: true,
          result: LinkShareRoles.all.filter((r) => r.folder === true)
        }
      ],
      [
        'all file related share roles',
        {
          folder: false,
          result: LinkShareRoles.all.filter((r) => r.folder === false)
        }
      ]
    ])('%s', (name: string, { folder, result }) => {
      expect(LinkShareRoles.list(folder)).toEqual(result)
    })
  })
  describe('getByBitmask', () => {
    it.each([
      [
        'viewer role for folders',
        {
          bitmask: linkRoleViewerFolder.bitmask(false),
          folder: true,
          role: linkRoleViewerFolder
        }
      ],
      [
        'viewer role for files',
        {
          bitmask: linkRoleViewerFile.bitmask(false),
          folder: false,
          role: linkRoleViewerFile
        }
      ],
      [
        'contributor role for folders',
        {
          bitmask: linkRoleContributorFolder.bitmask(false),
          folder: true,
          role: linkRoleContributorFolder
        }
      ],
      [
        'editor role for folders',
        {
          bitmask: linkRoleEditorFolder.bitmask(false),
          folder: true,
          role: linkRoleEditorFolder
        }
      ],
      [
        'uploader role for folders',
        {
          bitmask: linkRoleUploaderFolder.bitmask(false),
          folder: true,
          role: linkRoleUploaderFolder
        }
      ]
    ])('identifies correct role with %s', (name: string, { bitmask, folder, role }) => {
      expect(LinkShareRoles.getByBitmask(bitmask, folder)).toBe(role)
    })
  })
})
