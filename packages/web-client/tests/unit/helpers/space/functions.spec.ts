import { buildSpace, ProjectSpaceResource } from '../../../../src/helpers/space'
import { spaceRoleEditor, spaceRoleManager, spaceRoleViewer } from '../../../../src/helpers/share'

describe('buildSpace', () => {
  const uuid = '1'

  describe('isViewer', () => {
    it.each([
      { role: spaceRoleViewer.name, expectedResult: true },
      { role: spaceRoleEditor.name, expectedResult: false },
      { role: spaceRoleManager.name, expectedResult: false }
    ])('returns true for a viewer of the space', (data) => {
      const space = buildSpace({
        root: {
          permissions: [{ roles: data.role, grantedToIdentities: [{ user: { id: uuid } }] }]
        }
      }) as ProjectSpaceResource
      expect(space.isViewer({ uuid } as any)).toBe(data.expectedResult)
    })
  })

  describe('isEditor', () => {
    it.each([
      { role: spaceRoleViewer.name, expectedResult: false },
      { role: spaceRoleEditor.name, expectedResult: true },
      { role: spaceRoleManager.name, expectedResult: false }
    ])('returns true for a editor of the space', (data) => {
      const space = buildSpace({
        root: {
          permissions: [{ roles: data.role, grantedToIdentities: [{ user: { id: uuid } }] }]
        }
      }) as ProjectSpaceResource
      expect(space.isEditor({ uuid } as any)).toBe(data.expectedResult)
    })
  })

  describe('isManager', () => {
    it.each([
      { role: spaceRoleViewer.name, expectedResult: false },
      { role: spaceRoleEditor.name, expectedResult: false },
      { role: spaceRoleManager.name, expectedResult: true }
    ])('returns true for a manager of the space', (data) => {
      const space = buildSpace({
        root: {
          permissions: [{ roles: data.role, grantedToIdentities: [{ user: { id: uuid } }] }]
        }
      }) as ProjectSpaceResource
      expect(space.isManager({ uuid } as any)).toBe(data.expectedResult)
    })
  })
})
