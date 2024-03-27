import { buildSpace, ProjectSpaceResource } from '../../../../src/helpers/space'
import { mock } from 'vitest-mock-extended'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Drive, User } from '@ownclouders/web-client/src/generated'

describe('buildSpace', () => {
  const id = '1'

  describe('isViewer', () => {
    it.each([
      { role: 'viewer', expectedResult: true },
      { role: 'editor', expectedResult: false },
      { role: 'manager', expectedResult: false }
    ])('returns true for a viewer of the space', (data) => {
      const space = buildSpace(
        mock<Drive>({
          special: null,
          root: {
            permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
          }
        })
      ) as ProjectSpaceResource
      expect(space.isViewer(mock<User>({ id }))).toBe(data.expectedResult)
    })
  })

  describe('isEditor', () => {
    it.each([
      { role: 'viewer', expectedResult: false },
      { role: 'editor', expectedResult: true },
      { role: 'manager', expectedResult: false }
    ])('returns true for a editor of the space', (data) => {
      const space = buildSpace(
        mock<Drive>({
          special: null,
          root: {
            permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
          }
        })
      ) as ProjectSpaceResource
      expect(space.isEditor(mock<User>({ id }))).toBe(data.expectedResult)
    })
  })

  describe('isManager', () => {
    it.each([
      { role: 'viewer', expectedResult: false },
      { role: 'editor', expectedResult: false },
      { role: 'manager', expectedResult: true }
    ])('returns true for a manager of the space', (data) => {
      const space = buildSpace(
        mock<Drive>({
          special: null,
          root: {
            permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
          }
        })
      ) as ProjectSpaceResource
      expect(space.isManager(mock<User>({ id }))).toBe(data.expectedResult)
    })
  })

  it.each([
    { role: 'viewer', expectedResult: false },
    { role: 'editor', expectedResult: true },
    { role: 'manager', expectedResult: true }
  ])('canUpload', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canUpload({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    {
      userCan: false,
      spaceRole: 'manager',
      spaceDisabled: true,
      expectedResult: true
    },
    {
      userCan: false,
      spaceRole: 'editor',
      spaceDisabled: true,
      expectedResult: false
    },
    {
      userCan: false,
      spaceRole: 'viewer',
      spaceDisabled: true,
      expectedResult: false
    },
    {
      userCan: true,
      spaceRole: 'viewer',
      spaceDisabled: true,
      expectedResult: true
    },
    {
      userCan: true,
      spaceRole: 'viewer',
      spaceDisabled: false,
      expectedResult: false
    }
  ])('canBeDeleted', (data) => {
    const ability = mock<Ability>({ can: () => data.userCan })
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.spaceRole], grantedToIdentities: [{ user: { id } }] }],
          ...(data.spaceDisabled && { deleted: { state: 'trashed' } })
        }
      })
    ) as ProjectSpaceResource
    expect(space.canBeDeleted({ user: mock<User>({ id }), ability })).toBe(data.expectedResult)
  })

  it.each([
    { spaceRole: 'manager', expectedResult: true },
    { spaceRole: 'editor', expectedResult: false },
    { spaceRole: 'viewer', expectedResult: false }
  ])('canRename', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.spaceRole], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canRename({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    { spaceRole: 'manager', expectedResult: true },
    { spaceRole: 'editor', expectedResult: false },
    { spaceRole: 'viewer', expectedResult: false }
  ])('canEditDescription', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.spaceRole], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canEditDescription({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    {
      spaceRole: 'manager',
      spaceDisabled: true,
      expectedResult: true
    },
    {
      spaceRole: 'editor',
      spaceDisabled: true,
      expectedResult: false
    },
    {
      spaceRole: 'viewer',
      spaceDisabled: true,
      expectedResult: false
    }
  ])('canRestore', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.spaceRole], grantedToIdentities: [{ user: { id } }] }],
          ...(data.spaceDisabled && { deleted: { state: 'trashed' } })
        }
      })
    ) as ProjectSpaceResource
    expect(space.canRestore({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    {
      userCan: false,
      spaceRole: 'manager',
      spaceDisabled: false,
      expectedResult: true
    },
    {
      userCan: false,
      spaceRole: 'editor',
      spaceDisabled: false,
      expectedResult: false
    },
    {
      userCan: false,
      spaceRole: 'viewer',
      spaceDisabled: false,
      expectedResult: false
    },
    {
      userCan: true,
      spaceRole: 'viewer',
      spaceDisabled: false,
      expectedResult: true
    },
    {
      userCan: true,
      spaceRole: 'viewer',
      spaceDisabled: true,
      expectedResult: false
    }
  ])('canDisable', (data) => {
    const ability = mock<Ability>({ can: () => data.userCan })
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.spaceRole], grantedToIdentities: [{ user: { id } }] }],
          ...(data.spaceDisabled && { deleted: { state: 'trashed' } })
        }
      })
    ) as ProjectSpaceResource
    expect(space.canDisable({ user: mock<User>({ id }), ability })).toBe(data.expectedResult)
  })

  it.each([
    { role: 'manager', expectedResult: true },
    { role: 'editor', expectedResult: false },
    { role: 'viewer', expectedResult: false }
  ])('canShare', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canShare({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    { role: 'manager', expectedResult: true },
    { role: 'editor', expectedResult: true },
    { role: 'viewer', expectedResult: false }
  ])('canEditImage', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canEditImage({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })

  it.each([
    { role: 'manager', expectedResult: true },
    { role: 'editor', expectedResult: true },
    { role: 'viewer', expectedResult: false }
  ])('canEditReadme', (data) => {
    const space = buildSpace(
      mock<Drive>({
        special: null,
        root: {
          permissions: [{ roles: [data.role], grantedToIdentities: [{ user: { id } }] }]
        }
      })
    ) as ProjectSpaceResource
    expect(space.canEditReadme({ user: mock<User>({ id }) })).toBe(data.expectedResult)
  })
})
