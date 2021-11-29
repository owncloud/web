export enum ShareType {
  user = 0,
  group = 1,
  link = 3,
  guest = 4,
  remote = 6
}

export abstract class ShareTypes {
  static readonly individuals = [ShareType.user, ShareType.guest, ShareType.remote]
  static readonly unauthenticated = [ShareType.link]
  static readonly authenticated = [
    ShareType.user,
    ShareType.group,
    ShareType.guest,
    ShareType.remote
  ]
}
