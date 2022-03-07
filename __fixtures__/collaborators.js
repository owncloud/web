import {
  peopleRoleEditorFile,
  peopleRoleViewerFile,
  spaceRoleEditor
} from '../packages/web-app-files/src/helpers/share'

export default [
  {
    shareType: 0,
    id: "f5c28709-b921-4ec8-b39a-4c243709b514",
    collaborator: {
      name: "einstein",
      displayName: "Albert Einstein",
      additionalInfo: "einstein@example.org"
    },
    owner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    fileOwner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    stime: "1639152810",
    permissions: 15,
    customPermissions: [
      {
        _key: "read",
        _bit: 1,
        _label: "Read"
      },
      {
        _key: "update",
        _bit: 2,
        _label: "Update"
      },
      {
        _key: "create",
        _bit: 4,
        _label: "Create"
      },
      {
        _key: "delete",
        _bit: 8,
        _label: "Delete"
      }
    ],
    role: peopleRoleEditorFile,
    path: "/Neuer Ordner-'singe'",
    key: "collaborator-f5c28709-b921-4ec8-b39a-4c243709b514"
  },
  {
    shareType: 1,
    id: "51a8aafe-cd40-4d0a-8566-87a1149b7fea",
    collaborator: {
      name: "physics-lovers",
      displayName: "physics-lovers",
      additionalInfo: null
    },
    owner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    fileOwner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    stime: "1639570515",
    permissions: 1,
    customPermissions: [
      {
        _key: "read",
        _bit: 1,
        _label: "Read"
      }
    ],
    role: peopleRoleViewerFile,
    path: "/Neuer Ordner-'singe'",
    key: "collaborator-51a8aafe-cd40-4d0a-8566-87a1149b7fea"
  },
  {
    shareType: 4,
    id: "51a8aafe-cd40-4d0a-8566-87a1149b7fea",
    collaborator: {
      name: "guest-user",
      displayName: "guest-user",
      additionalInfo: null
    },
    owner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    fileOwner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    stime: "1639570515",
    permissions: 1,
    customPermissions: [
      {
        _key: "read",
        _bit: 1,
        _label: "Read"
      }
    ],
    role: peopleRoleViewerFile,
    path: "/Neuer Ordner-'singe'",
    key: "collaborator-51a8aafe-cd40-4d0a-8566-87a1149b7fea"
  },
  {
    shareType: 6,
    id: "51a8aafe-cd40-4d0a-8566-87a1149b7fea",
    collaborator: {
      name: "remote-user",
      displayName: "remote-user",
      additionalInfo: null
    },
    owner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    fileOwner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    stime: "1639570515",
    permissions: 1,
    customPermissions: [
      {
        _key: "read",
        _bit: 1,
        _label: "Read"
      }
    ],
    role: peopleRoleViewerFile,
    path: "/Neuer Ordner-'singe'",
    key: "collaborator-51a8aafe-cd40-4d0a-8566-87a1149b7fea"
  },
  {
    shareType: 7,
    id: "f5c28709-b921-4ec8-b39a-4c243709b514",
    collaborator: {
      name: "einstein",
      displayName: "Albert Einstein",
      additionalInfo: "einstein@example.org"
    },
    owner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    fileOwner: {
      name: "admin",
      displayName: "Admin",
      additionalInfo: "admin@example.org"
    },
    role: spaceRoleEditor
  }
]
