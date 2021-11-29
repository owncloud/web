import { ShareType } from './type'

export class ShareTypeCategory {
  private readonly _key: string
  private readonly _types: ShareType[]

  constructor(key: string, types: ShareType[]) {
    this._key = key
    this._types = types
  }

  get key(): string {
    return this._key
  }

  get types(): ShareType[] {
    return this._types
  }
}

export abstract class ShareTypeCategories {
  static readonly user = new ShareTypeCategory('user', [
    ShareType.user,
    ShareType.guest,
    ShareType.remote
  ])

  static readonly group = new ShareTypeCategory('group', [ShareType.group])
  static readonly link = new ShareTypeCategory('link', [ShareType.link])
  private static readonly all = [
    ShareTypeCategories.user,
    ShareTypeCategories.group,
    ShareTypeCategories.link
  ]

  public static getByShareType(type: ShareType): ShareTypeCategory {
    return ShareTypeCategories.all.find((c: ShareTypeCategory) => c.types.includes(type))
  }
}
