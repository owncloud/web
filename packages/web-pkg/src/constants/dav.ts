export abstract class DavPermission {
  static readonly Shared: string = 'S'
  static readonly Shareable: string = 'R'
  static readonly Mounted: string = 'M'
  static readonly Deletable: string = 'D'
  static readonly Renameable: string = 'N'
  static readonly Moveable: string = 'V'
  static readonly Updateable: string = 'NV'
  static readonly FileUpdateable: string = 'W'
  static readonly FolderCreateable: string = 'CK'
  static readonly Deny: string = 'Z'
}

export abstract class DavProperty {
  static readonly Permissions: string = '{http://owncloud.org/ns}permissions'
  static readonly IsFavorite: string = '{http://owncloud.org/ns}favorite'
  static readonly FileId: string = '{http://owncloud.org/ns}fileid'
  static readonly OwnerId: string = '{http://owncloud.org/ns}owner-id'
  static readonly OwnerDisplayName: string = '{http://owncloud.org/ns}owner-display-name'
  static readonly PrivateLink: string = '{http://owncloud.org/ns}privatelink'
  static readonly ContentLength: string = '{DAV:}getcontentlength'
  static readonly ContentSize: string = '{http://owncloud.org/ns}size'
  static readonly LastModifiedDate: string = '{DAV:}getlastmodified'
  static readonly ETag: string = '{DAV:}getetag'
  static readonly MimeType: string = '{DAV:}getcontenttype'
  static readonly ResourceType: string = '{DAV:}resourcetype'
  static readonly DownloadURL: string = '{http://owncloud.org/ns}downloadURL'

  static readonly ShareTypes: string = '{http://owncloud.org/ns}share-types'
  static readonly SharePermissions: string =
    '{http://open-collaboration-services.org/ns}share-permissions'

  static readonly TrashbinOriginalFilename: string =
    '{http://owncloud.org/ns}trashbin-original-filename'

  static readonly TrashbinOriginalLocation: string =
    '{http://owncloud.org/ns}trashbin-original-location'

  static readonly TrashbinDeletedDate: string = '{http://owncloud.org/ns}trashbin-delete-datetime'

  static readonly PublicLinkItemType: string = '{http://owncloud.org/ns}public-link-item-type'
  static readonly PublicLinkPermission: string = '{http://owncloud.org/ns}public-link-permission'
  static readonly PublicLinkExpiration: string = '{http://owncloud.org/ns}public-link-expiration'
  static readonly PublicLinkShareDate: string = '{http://owncloud.org/ns}public-link-share-datetime'
  static readonly PublicLinkShareOwner: string = '{http://owncloud.org/ns}public-link-share-owner'
}

export abstract class DavProperties {
  static readonly Default: DavProperty[] = [
    DavProperty.Permissions,
    DavProperty.IsFavorite,
    DavProperty.FileId,
    DavProperty.OwnerId,
    DavProperty.OwnerDisplayName,
    DavProperty.ShareTypes,
    DavProperty.PrivateLink,
    DavProperty.ContentLength,
    DavProperty.ContentSize,
    DavProperty.LastModifiedDate,
    DavProperty.ETag,
    DavProperty.MimeType,
    DavProperty.ResourceType,
    DavProperty.DownloadURL
  ]

  static readonly PublicLink: DavProperty[] = DavProperties.Default.concat([
    DavProperty.PublicLinkItemType,
    DavProperty.PublicLinkPermission,
    DavProperty.PublicLinkExpiration,
    DavProperty.PublicLinkShareDate,
    DavProperty.PublicLinkShareOwner
  ])

  static readonly Trashbin: DavProperty[] = [
    DavProperty.ContentLength,
    DavProperty.ResourceType,
    DavProperty.TrashbinOriginalLocation,
    DavProperty.TrashbinOriginalFilename,
    DavProperty.TrashbinDeletedDate,
    DavProperty.Permissions
  ]
}
