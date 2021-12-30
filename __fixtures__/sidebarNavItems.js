export default [
  {
    name: "All files",
    iconMaterial: "folder",
    route: {
      name: "files-personal",
      path: "/files/list/all"
    },
    active: true
  },
  {
    name: "Shared with me",
    iconMaterial: "shared-with-me",
    route: {
      name: "files-shared-with-me",
      path: "/files/list/shared-with-me"
    },
    active: false
  },
  {
    name: "Shared with others",
    iconMaterial: "shared-with-others",
    route: {
      name: "files-shared-with-others",
      path: "/files/list/shared-with-others"
    },
    active: false
  },
  {
    name: "Shared via link",
    iconMaterial: "link",
    route: {
      name: "files-shared-via-link",
      path: "/files/list/shared-via-link"
    },
    active: false
  },
  {
    name: "Deleted files",
    iconMaterial: "delete",
    route: {
      name: "files-trashbin",
      path: "/files/list/trash-bin"
    },
    active: false
  }
]

