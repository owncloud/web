import publicLinkRolesDefinition from '@files/src/helpers/publicLinkRolesDefinition'

describe('publicLinkRolesDefinition', () => {
  it('should return viewer role for resources other than folder', () => {
    expect(publicLinkRolesDefinition({})).toMatchObject([
      {
        name: 'viewer',
        label: 'Viewer',
        description: 'Recipients can view and download contents.',
        permissions: 1
      }
    ])
  })
  it('should return extended roles for folder', () => {
    expect(publicLinkRolesDefinition({ isFolder: true })).toMatchObject([
      {
        name: 'viewer',
        label: 'Viewer',
        description: 'Recipients can view and download contents.',
        permissions: 1
      },
      {
        name: 'contributor',
        label: 'Contributor',
        description: 'Recipients can view, download and upload contents.',
        permissions: 5
      },
      {
        name: 'editor',
        label: 'Editor',
        description: 'Recipients can view, download, edit, delete and upload contents.',
        permissions: 15
      },
      {
        name: 'uploader',
        label: 'Uploader',
        description: 'Recipients can upload but existing contents are not revealed.',
        permissions: 4
      }
    ])
  })
})
