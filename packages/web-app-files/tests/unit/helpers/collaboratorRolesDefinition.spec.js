import collaboratorRolesDefinition from '../../../src/helpers/collaboratorRolesDefinition'

describe('collaboratorRolesDefinition', () => {
  describe('when "allow share permission" is set to true', () => {
    const rolesDefinition = collaboratorRolesDefinition({
      allowSharePerm: true
    })

    it('should have share permission for viewer and editor', () => {
      expect(rolesDefinition[0].permissions).toContain('share')
      expect(rolesDefinition[1].permissions).toContain('share')
    })
  })

  describe('when "allow share permission" is set to false', () => {
    const rolesDefinition = collaboratorRolesDefinition({
      allowSharePerm: false
    })

    it('should not have share permission for viewer and editor', () => {
      expect(rolesDefinition[0].permissions).not.toContain('share')
      expect(rolesDefinition[1].permissions).not.toContain('share')
    })
  })
  describe('item type', () => {
    const batches = [
      {
        input: {
          allowSharePerm: true,
          isFolder: true
        },
        expectedDescription: 'Upload, edit, delete, download, preview and share'
      },
      {
        input: {
          allowSharePerm: true,
          isFolder: false
        },
        expectedDescription: 'Edit, download, preview and share'
      },
      {
        input: {
          allowSharePerm: false,
          isFolder: true
        },
        expectedDescription: 'Upload, edit, delete, download and preview'
      },
      {
        input: {
          allowSharePerm: false,
          isFolder: false
        },
        expectedDescription: 'Edit, download and preview'
      }
    ]
    it.each(batches)('description of editor role definition', batch => {
      const rolesDefinition = collaboratorRolesDefinition(batch.input)

      expect(rolesDefinition[1].description).toBe(batch.expectedDescription)
    })
  })
})
