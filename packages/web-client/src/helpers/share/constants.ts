/** @deprecated */
export abstract class SharePermissionBit {
  static readonly Internal: number = 0
  static readonly Read: number = 1
  static readonly Update: number = 2
  static readonly Create: number = 4
  static readonly Delete: number = 8
  static readonly Share: number = 16
}

// map human readable role names to graph share role ids
export const GraphShareRoleIdMap = {
  Viewer: 'b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5',
  SpaceViewer: 'a8d5fe5e-96e3-418d-825b-534dbdf22b99',
  FileEditor: '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a',
  FolderEditor: 'fb6c3e19-e378-47e5-b277-9732f9de6e21',
  SpaceEditor: '58c63c02-1d89-4572-916a-870abc5a1b7d',
  SpaceManager: '312c0871-5ef7-4b3a-85b6-0e4074c64049'
} as const
