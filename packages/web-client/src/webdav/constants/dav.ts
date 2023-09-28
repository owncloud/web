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

type M<V, T> = {
  value: V
  type: T
}

const def = <V, T>(v: V): M<V, T> => ({
  value: v,
  type: null
})
const defString = <V>(v: V) => def<V, string>(v)
const defStringArray = <V>(v: V) => def<V, string[]>(v)

const DavPropertyMapping = {
  Permissions: defString('{http://owncloud.org/ns}permissions' as const),
  IsFavorite: defString('{http://owncloud.org/ns}favorite' as const),
  FileId: defString('{http://owncloud.org/ns}fileid' as const),
  FileParent: defString('{http://owncloud.org/ns}file-parent' as const),
  Name: defString('{http://owncloud.org/ns}name' as const),
  OwnerId: defString('{http://owncloud.org/ns}owner-id' as const),
  OwnerDisplayName: defString('{http://owncloud.org/ns}owner-display-name' as const),
  PrivateLink: defString('{http://owncloud.org/ns}privatelink' as const),
  ContentLength: defString('{DAV:}getcontentlength' as const),
  ContentSize: defString('{http://owncloud.org/ns}size' as const),
  LastModifiedDate: defString('{DAV:}getlastmodified' as const),
  Tags: defString('{http://owncloud.org/ns}tags' as const),
  ETag: defString('{DAV:}getetag' as const),
  MimeType: defString('{DAV:}getcontenttype' as const),
  ResourceType: defStringArray('{DAV:}resourcetype' as const),
  LockDiscovery: defString('{DAV:}lockdiscovery' as const),
  LockOwnerName: defString('{http://owncloud.org/ns}ownername' as const),
  LockTime: defString('{http://owncloud.org/ns}locktime' as const),
  ActiveLock: {
    value: '{DAV:}activelock',
    type: null as Record<string, unknown>
  },
  DownloadURL: defString('{http://owncloud.org/ns}downloadURL' as const),
  Highlights: defString('{http://owncloud.org/ns}highlights' as const),

  ShareId: defString('{http://owncloud.org/ns}shareid' as const),
  ShareRoot: defString('{http://owncloud.org/ns}shareroot' as const),
  ShareTypes: defStringArray('{http://owncloud.org/ns}share-types' as const),
  SharePermissions: defString(
    '{http://open-collaboration-services.org/ns}share-permissions' as const
  ),

  TrashbinOriginalFilename: defString(
    '{http://owncloud.org/ns}trashbin-original-filename' as const
  ),
  TrashbinOriginalLocation: defString(
    '{http://owncloud.org/ns}trashbin-original-location' as const
  ),
  TrashbinDeletedDate: defString('{http://owncloud.org/ns}trashbin-delete-datetime' as const),

  PublicLinkItemType: defString('{http://owncloud.org/ns}public-link-item-type' as const),
  PublicLinkPermission: defString('{http://owncloud.org/ns}public-link-permission' as const),
  PublicLinkExpiration: defString('{http://owncloud.org/ns}public-link-expiration' as const),
  PublicLinkShareDate: defString('{http://owncloud.org/ns}public-link-share-datetime' as const),
  PublicLinkShareOwner: defString('{http://owncloud.org/ns}public-link-share-owner' as const)
} as const satisfies Record<string, M<unknown, unknown>>

type DavPropertyMappingType = typeof DavPropertyMapping

export const DavProperty = Object.fromEntries(
  Object.entries(DavPropertyMapping).map(([key, value]) => [key, value.value])
) as {
  [K in keyof DavPropertyMappingType as K]: DavPropertyMappingType[K]['value']
}

export type DavFileInfoResponse = {
  [K in keyof DavPropertyMappingType as DavPropertyMappingType[K]['value']]: DavPropertyMappingType[K]['type']
}

export type DavPropertyValue = (typeof DavProperty)[keyof typeof DavProperty]

export abstract class DavProperties {
  static readonly Default: DavPropertyValue[] = [
    DavProperty.Permissions,
    DavProperty.IsFavorite,
    DavProperty.FileId,
    DavProperty.FileParent,
    DavProperty.Name,
    DavProperty.LockDiscovery,
    DavProperty.ActiveLock,
    DavProperty.OwnerId,
    DavProperty.OwnerDisplayName,
    DavProperty.ShareId,
    DavProperty.ShareRoot,
    DavProperty.ShareTypes,
    DavProperty.PrivateLink,
    DavProperty.ContentLength,
    DavProperty.ContentSize,
    DavProperty.LastModifiedDate,
    DavProperty.ETag,
    DavProperty.MimeType,
    DavProperty.ResourceType,
    DavProperty.DownloadURL,
    DavProperty.Tags
  ]

  static readonly PublicLink: DavPropertyValue[] = DavProperties.Default.concat([
    DavProperty.PublicLinkItemType,
    DavProperty.PublicLinkPermission,
    DavProperty.PublicLinkExpiration,
    DavProperty.PublicLinkShareDate,
    DavProperty.PublicLinkShareOwner
  ])

  static readonly Trashbin: DavPropertyValue[] = [
    DavProperty.ContentLength,
    DavProperty.ResourceType,
    DavProperty.TrashbinOriginalLocation,
    DavProperty.TrashbinOriginalFilename,
    DavProperty.TrashbinDeletedDate,
    DavProperty.Permissions,
    DavProperty.FileParent
  ]
}
