export default [
  {
    name: "All files",
    icon: "folder",
    route: {
      name: "files-personal",
      path: "/files/list/all"
    },
    active: true
  },
  {
    name: "Shared with me",
    icon: "shared-with-me",
    route: {
      name: "files-shared-with-me",
      path: "/files/list/shared-with-me"
    },
    active: false
  },
  {
    name: "Shared with others",
    icon: "shared-with-others",
    route: {
      name: "files-shared-with-others",
      path: "/files/list/shared-with-others"
    },
    active: false
  },
  {
    name: "Shared via link",
    icon: "link",
    route: {
      name: "files-shared-via-link",
      path: "/files/list/shared-via-link"
    },
    active: false
  },
  {
    name: "Deleted files",
    icon: "delete",
    route: {
      name: "files-trashbin",
      path: "/files/list/trash-bin"
    },
    active: false
  }
]

