describe('resources', () => {
  describe('getFileIcon', () => {
    it.todo('should return "file" if given extension doesn\'t exist in "fileIconMappings"')
    it.todo('should return an icon matched with given extension in "fileIconMappings"')
  })

  describe('buildResource', () => {
    it.todo("should set the resource 'path' as given resource's name")
    it.todo("should set the resource 'indicator' as an empty array")
    it.todo("should set the resource 'name' as given resource's name's basename")

    describe('fileInfo DavProperty', () => {
      it.todo('should set the resource "id" and "fileId" as "FileId" property')
      it.todo('should set the resource "mimeType" as "MimeType" property')
      it.todo('should set the resource "mdate" as "LastModifiedDate" property')
      it.todo('should set the resource "etag" as "ETag" property')
      it.todo('should set the resource "sharePermissions" as "SharePermissions" property')
      it.todo('should set the resource "privateLink" as "PrivateLink" property')
      it.todo('should set the resource "downloadURL" as "DownloadURL" property')

      it.todo('should set the resource "ownerDisplayName" as "OwnerDisplayName" property')
      it.todo('should set the resource "ownerId" as "OwnerId" property')

      describe('resource size', () => {
        it.todo('should be set as "ContentSize" property if given resource is a folder')
        it.todo('should be set as "ContentLength" property if given resource is not a folder')
      })

      describe('resource shareTypes', () => {
        it.todo('should return an empty array if "ShareTypes" property is falsy')
        it.todo('should return array of "ShareTypes" property items')
      })

      describe('resource starred', () => {
        it.todo('should be set as "true" if "IsFavorite" property does not equals "0"')
        it.todo('should be set as "false" if "IsFavorite" property equals "0"')
      })

      describe('resource permissions', () => {
        it.todo('should be set as "Permissions" property if not falsy')
        it.todo('should be set as empty string if "Permissions" property is falsy')
      })

      describe('canUpload', () => {
        it(
          'should be set as "true" if "FolderCreateable" property exists in the resource permissions array'
        )
        it(
          'should be set as "false" if "FolderCreateable" property does not exist in the resource permissions array'
        )
      })

      describe('canBeDeleted', () => {
        it.todo(
          'should return "true" if "Deletable" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "Deletable" property does not exist in the resource permissions array'
        )
      })

      describe('canRename', () => {
        it.todo(
          'should return "true" if "Renameable" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "Renameable" property does not exist in the resource permissions array'
        )
      })

      describe('canShare', () => {
        it.todo(
          'should return "true" if "Shareable" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "Shareable" property does not exist in the resource permissions array'
        )
      })

      describe('canCreate', () => {
        it.todo(
          'should return "true" if "FolderCreateable" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "FolderCreateable" property does not exist in the resource permissions array'
        )
      })

      describe('isMounted', () => {
        it.todo(
          'should return "true" if "Mounted" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "Mounted" property does not exist in the resource permissions array'
        )
      })

      describe('isReceivedShare', () => {
        it.todo(
          'should return "true" if "Shared" property exists in the resource permissions array'
        )
        it.todo(
          'should return "false" if "Shared" property does not exist in the resource permissions array'
        )
      })
    })

    describe('resource icon', () => {
      it.todo('should be set as "folder" if given resource is a folder')
      it.todo('should be set as an extension file icon if given resource is not a folder')
    })

    describe('resource extension', () => {
      it.todo('should be set as an empty string if given resource is a folder')
      it.todo("should be set as given resource's file extension if given resource is not a folder")
    })

    describe('resource type', () => {
      it.todo('should be set as "folder" if given resource\'s type is "dir"')
      it.todo('should be set as given resource\'s type if it has value other than "dir"')
    })

    describe('canDownload', () => {
      it.todo('should be set as "true" if given resource is not a folder')
      it.todo('should be set as "false" if given resource is a folder')
    })
  })

  describe('attachIndicators', () => {
    it.todo(
      'should set resource "indicator" as indicators returned from "getIndicators" helper method'
    )
  })

  describe('aggregateResourceShares', () => {
    // it.todo('')
  })
})
