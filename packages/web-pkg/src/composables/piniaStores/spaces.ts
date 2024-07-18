import { defineStore } from 'pinia'
import { computed, ref, unref } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { Graph } from '@ownclouders/web-client/graph'
import {
  GraphShareRoleIdMap,
  buildSpace,
  extractStorageId,
  isPersonalSpaceResource,
  isProjectSpaceResource
} from '@ownclouders/web-client'
import type { CollaboratorShare } from '@ownclouders/web-client'
import { useUserStore } from './user'
import { ConfigStore, useConfigStore } from './config'
import { buildCollaboratorShare } from '@ownclouders/web-client'
import { useSharesStore } from './shares'

export const sortSpaceMembers = (shares: CollaboratorShare[]) => {
  const sortedManagers = shares
    .filter((share) => share.role.id === GraphShareRoleIdMap.SpaceManager)
    .sort((a, b) => a.sharedWith.displayName.localeCompare(b.sharedWith.displayName))

  const sortedRest = shares
    .filter((share) => share.role.id !== GraphShareRoleIdMap.SpaceManager)
    .sort((a, b) => a.sharedWith.displayName.localeCompare(b.sharedWith.displayName))

  return [...sortedManagers, ...sortedRest]
}

export const getSpacesByType = async ({
  graphClient,
  driveType,
  configStore
}: {
  graphClient: Graph
  driveType: string
  configStore: ConfigStore
}) => {
  const mountpoints = await graphClient.drives.listMyDrives({
    orderBy: 'name asc',
    filter: `driveType eq ${driveType}`
  })
  if (!mountpoints.length) {
    return []
  }

  if (driveType !== 'mountpoint' || !configStore.options.routing?.fullShareOwnerPaths) {
    return mountpoints
  }

  const rootSpaceDriveAliasMapping: Record<string, string> = {}
  mountpoints.forEach((space) => {
    const { rootId, driveAlias } = space.root.remoteItem
    rootSpaceDriveAliasMapping[rootId] = driveAlias
  })

  const rootSpaces = Object.entries(rootSpaceDriveAliasMapping).map(([id, driveAlias]) =>
    // FIXME: create proper buildRootSpace (or whatever function)
    buildSpace({
      id: extractStorageId(id),
      name: driveAlias, // FIXME: set a proper name
      driveType: driveAlias.split('/')[0], // FIXME: can we retrieve this from api?
      driveAlias,
      path: '/',
      serverUrl: configStore.serverUrl
    })
  )

  return [...mountpoints, ...rootSpaces]
}

export const useSpacesStore = defineStore('spaces', () => {
  const userStore = useUserStore()
  const configStore = useConfigStore()
  const sharesStore = useSharesStore()

  const spaces = ref<SpaceResource[]>([])
  const spaceMembers = ref<CollaboratorShare[]>([])
  const currentSpace = ref<SpaceResource>()
  const spacesInitialized = ref(false)
  const mountPointsInitialized = ref(false)
  const spacesLoading = ref(false)

  const personalSpace = computed(() => {
    return unref(spaces).find((s) => isPersonalSpaceResource(s) && s.isOwner(userStore.user))
  })

  const setSpacesInitialized = (value: boolean) => {
    spacesInitialized.value = value
  }

  const setMountPointsInitialized = (value: boolean) => {
    mountPointsInitialized.value = value
  }

  const setSpacesLoading = (value: boolean) => {
    spacesLoading.value = value
  }

  const setCurrentSpace = (space: SpaceResource) => {
    currentSpace.value = space
  }

  const setSpaceMembers = (members: CollaboratorShare[]) => {
    spaceMembers.value = members
  }

  const addSpaces = (s: SpaceResource[]) => {
    unref(spaces).push(...s)
  }

  const removeSpace = (space: SpaceResource) => {
    spaces.value = unref(spaces).filter(({ id }) => id !== space.id)
  }

  const upsertSpace = (space: SpaceResource) => {
    const existingSpace = unref(spaces).find(({ id }) => id === space.id)
    if (existingSpace) {
      Object.assign(existingSpace, space)
      return
    }
    addSpaces([space])
  }

  const updateSpaceField = <T extends SpaceResource>({
    id,
    field,
    value
  }: {
    id: T['id']
    field: keyof T
    value: T[keyof T]
  }) => {
    const space = unref(spaces).find((space) => id === space.id) as T
    if (space) {
      space[field] = value
    }
  }

  const loadSpaces = async ({ graphClient }: { graphClient: Graph }) => {
    spacesLoading.value = true
    try {
      /**
       * FIXME: this is bad for two reasons:
       * 1. fetching by specific drive type is bad because if more drive types are being added it needs additional code.
       *    as soon as the backend allows to filter by `driveType neq virtual` we want to use that here.
       * 2. fetching the mountpoint drives only on first access is kind of error prone, because mount points are
       *    trying to be accessed in multiple code locations. all of them need to check now if mountpoints need to be
       *    fetched first. but at the moment fetching mountpoints is kind of expensive, so we need to accept that for now.
       */
      const [personalSpaces, projectSpaces] = await Promise.all([
        getSpacesByType({ graphClient, driveType: 'personal', configStore }),
        getSpacesByType({ graphClient, driveType: 'project', configStore })
      ])

      addSpaces([...personalSpaces, ...projectSpaces])
      spacesInitialized.value = true
    } finally {
      spacesLoading.value = false
    }
  }

  const loadMountPoints = async ({ graphClient }: { graphClient: Graph }) => {
    // fetching mount points is particularly expensive, so we do that only on first access.
    if (unref(mountPointsInitialized)) {
      return
    }
    try {
      const mountPointSpaces = await getSpacesByType({
        graphClient,
        driveType: 'mountpoint',
        configStore
      })
      addSpaces(mountPointSpaces)
    } finally {
      mountPointsInitialized.value = true
    }
  }

  const reloadProjectSpaces = async ({ graphClient }: { graphClient: Graph }) => {
    const projectSpaces = await getSpacesByType({ graphClient, driveType: 'project', configStore })
    spaces.value = unref(spaces).filter((s) => !isProjectSpaceResource(s))
    addSpaces(projectSpaces)
  }

  const loadSpaceMembers = async ({
    graphClient,
    space
  }: {
    graphClient: Graph
    space: SpaceResource
  }) => {
    spaceMembers.value = []
    const spaceShares: CollaboratorShare[] = []

    const { data } = await graphClient.permissions.listPermissionsSpaceRoot(space.id)

    const permissions = data.value || []
    permissions.forEach((graphPermission) => {
      if (!graphPermission.link) {
        spaceShares.push(
          buildCollaboratorShare({
            graphPermission,
            graphRoles: sharesStore.graphRoles,
            resourceId: space.id,
            user: userStore.user
          })
        )
      }
    })

    spaceMembers.value = sortSpaceMembers(spaceShares)
  }

  const upsertSpaceMember = ({ member }: { member: CollaboratorShare }) => {
    const existingMember = unref(spaceMembers).find(({ id }) => id === member.id)
    if (existingMember) {
      Object.assign(existingMember, member)
      return
    }

    unref(spaceMembers).push(member)
  }

  const removeSpaceMember = ({ member }: { member: CollaboratorShare }) => {
    const existingMember = unref(spaceMembers).find(({ id }) => id === member.id)
    spaceMembers.value = unref(spaceMembers).filter(({ id }) => existingMember.id !== id)
  }

  return {
    spaces,
    spacesInitialized,
    mountPointsInitialized,
    spacesLoading,
    spaceMembers,
    currentSpace,
    personalSpace,

    setSpacesInitialized,
    setMountPointsInitialized,
    setSpacesLoading,
    setCurrentSpace,
    setSpaceMembers,

    addSpaces,
    removeSpace,
    upsertSpace,
    updateSpaceField,
    loadSpaces,
    loadMountPoints,
    reloadProjectSpaces,

    loadSpaceMembers,
    upsertSpaceMember,
    removeSpaceMember
  }
})

export type SpacesStore = ReturnType<typeof useSpacesStore>
