import { defineStore } from 'pinia'
import { computed, ref, unref } from 'vue'
import { Graph, SpaceResource } from '@ownclouders/web-client'
import {
  ShareType,
  buildSpace,
  buildSpaceShare,
  extractStorageId,
  isPersonalSpaceResource,
  isProjectSpaceResource,
  spaceRoleManager
} from '@ownclouders/web-client/src/helpers'
import type { Share, ShareRole } from '@ownclouders/web-client/src/helpers'
import type { OwnCloudSdk } from '@ownclouders/web-client/src/types'
import { useUserStore } from './user'
import { ConfigStore, useConfigStore } from './config'

export const sortSpaceMembers = (shares: Share[]) => {
  const sortedManagers = shares
    .filter((share) => share.role.name === spaceRoleManager.name)
    .sort((a, b) => a.collaborator.displayName.localeCompare(b.collaborator.displayName))

  const sortedRest = shares
    .filter((share) => share.role.name !== spaceRoleManager.name)
    .sort((a, b) => a.collaborator.displayName.localeCompare(b.collaborator.displayName))

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
  const graphResponse = await graphClient.drives.listMyDrives(
    'name asc',
    `driveType eq ${driveType}`
  )
  if (!graphResponse.data) {
    return []
  }

  const mountpoints = graphResponse.data.value.map((space) =>
    buildSpace({ ...space, serverUrl: configStore.serverUrl })
  )
  if (driveType !== 'mountpoint' || !configStore.options.routing?.fullShareOwnerPaths) {
    return mountpoints
  }

  const rootSpaceDriveAliasMapping: Record<string, string> = {}
  graphResponse.data.value.forEach((space) => {
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

  const spaces = ref<SpaceResource[]>([])
  const spaceMembers = ref<Share[]>([])
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

  const updateSpaceField = <T extends SpaceResource, K extends keyof SpaceResource>({
    id,
    field,
    value
  }: {
    id: T['id']
    field: K
    value: T[K]
  }) => {
    const space = unref(spaces).find((space) => id === space.id)
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
    const promises = []
    const spaceShares: Share[] = []

    for (const role of Object.keys(space.spaceRoles)) {
      for (const { kind, id, expirationDate } of space.spaceRoles[role]) {
        const promise =
          kind === 'group' ? graphClient.groups.getGroup(id) : graphClient.users.getUser(id)

        promise.then((resolved) => {
          spaceShares.push(
            buildSpaceShare({ ...resolved.data, role, kind, expirationDate }, space.id)
          )
        })

        promises.push(promise)
      }
    }

    await Promise.allSettled(promises)
    spaceMembers.value = sortSpaceMembers(spaceShares)
  }

  const addSpaceMember = async ({
    client,
    graphClient,
    path,
    shareWith,
    permissions,
    expirationDate,
    role,
    storageId,
    displayName,
    shareType
  }: {
    client: OwnCloudSdk
    graphClient: Graph
    path: string
    shareWith: string
    permissions: number
    expirationDate: string
    role: ShareRole
    storageId: string
    displayName: string
    shareType: ShareType
  }) => {
    const additionalParams = { permissions, role: role.name, expirationDate }
    await client.shares.shareSpace(path, shareWith, shareType, storageId, additionalParams)
    const graphResponse = await graphClient.drives.getDrive(storageId)
    upsertSpace(buildSpace(graphResponse.data))
    unref(spaceMembers).push(
      buildSpaceShare(
        {
          role: role.name,
          onPremisesSamAccountName: shareWith,
          displayName,
          expirationDate,
          share_type: shareType
        },
        storageId
      )
    )
  }

  const changeSpaceMember = async ({
    client,
    graphClient,
    share,
    permissions,
    expirationDate,
    role
  }: {
    client: OwnCloudSdk
    graphClient: Graph
    share: Share
    permissions: number
    expirationDate: string
    role: ShareRole
  }) => {
    await client.shares.shareSpace(
      '',
      share.collaborator.name || share.collaborator.displayName,
      share.shareType,
      share.id,
      { permissions, role: role.name, expirationDate }
    )

    const graphResponse = await graphClient.drives.getDrive(share.id)
    upsertSpace(buildSpace(graphResponse.data))
    const spaceShare = buildSpaceShare(
      {
        role: role.name,
        onPremisesSamAccountName: share.collaborator.name,
        displayName: share.collaborator.displayName,
        expirationDate,
        share_type: share.shareType
      },
      share.id
    )

    const checkAttr = spaceShare.collaborator.name ? 'name' : 'displayName'
    const existingMember = unref(spaceMembers).find(
      ({ id, collaborator }) =>
        spaceShare.id === id && spaceShare.collaborator[checkAttr] === collaborator[checkAttr]
    )
    Object.assign(existingMember, spaceShare)
  }

  const deleteSpaceMember = async ({
    client,
    graphClient,
    share,
    reloadSpace = true
  }: {
    client: OwnCloudSdk
    graphClient: Graph
    share: Share
    reloadSpace: boolean
  }) => {
    const params = { shareWith: share.collaborator.name || share.collaborator.displayName }
    await client.shares.deleteShare(share.id, params)

    if (reloadSpace) {
      const graphResponse = await graphClient.drives.getDrive(share.id)
      upsertSpace(buildSpace(graphResponse.data))
    }

    const checkAttr = share.collaborator.name ? 'name' : 'displayName'
    const existingMember = unref(spaceMembers).find(
      ({ id, collaborator }) =>
        share.id === id && share.collaborator[checkAttr] === collaborator[checkAttr]
    )

    spaceMembers.value = unref(spaceMembers).filter(
      ({ id, collaborator }) =>
        existingMember.id !== id || share.collaborator[checkAttr] !== collaborator[checkAttr]
    )
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

    addSpaces,
    removeSpace,
    upsertSpace,
    updateSpaceField,
    loadSpaces,
    loadMountPoints,
    reloadProjectSpaces,

    addSpaceMember,
    loadSpaceMembers,
    changeSpaceMember,
    deleteSpaceMember
  }
})

export type SpacesStore = ReturnType<typeof useSpacesStore>
