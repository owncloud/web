import {
  buildMountPointSpaceResource,
  buildSpace,
  isProjectSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import { Ref, unref } from 'vue'
import { set, has } from 'lodash-es'
import { buildSpaceShare } from 'web-client/src/helpers/share'
import { sortSpaceMembers } from '../helpers/space/sortMembers'

import { configurationManager } from 'web-pkg/src/configuration'
import { Graph } from 'web-client'
import { AxiosResponse } from 'axios'

const state = {
  spaces: [],
  spacesInitialized: false,
  mountPointsInitialized: false,
  spacesLoading: false,
  spaceMembers: []
}

const getters = {
  spaces: (state) => state.spaces,
  spacesInitialized: (state) => state.spacesInitialized,
  mountPointsInitialized: (state) => state.mountPointsInitialized,
  spacesLoading: (state) => state.spacesLoading,
  spaceMembers: (state) => state.spaceMembers
}

const mutations = {
  // TODO: we might want to avoid duplicates at some point
  ADD_SPACES(state, spaces) {
    state.spaces = [...state.spaces, ...spaces]
  },
  SET_SPACES_INITIALIZED(state, initialized) {
    state.spacesInitialized = initialized
  },
  SET_MOUNT_POINTS_INITIALIZED(state, initialized) {
    state.mountPointsInitialized = initialized
  },
  SET_SPACES_LOADING(state, loading) {
    state.spacesLoading = loading
  },
  /**
   * Updates a single space field. If the space with given id doesn't exist, nothing will happen.
   *
   * @param state Current state of this store module
   * @param params
   * @param params.id Id of the resource to be updated
   * @param params.field the resource field that the value should be applied to
   * @param params.value the value that will be attached to the key
   */
  UPDATE_SPACE_FIELD(state, params) {
    const spaceSource = state.spaces
    const index = state.spaces.findIndex((r) => r.id === params.id)
    if (index < 0) {
      return
    }

    const resource = spaceSource[index]
    const isReactive = has(resource, params.field)
    const newResource = set(resource, params.field, params.value)

    if (isReactive) {
      return
    }

    spaceSource[index] = newResource
  },
  UPSERT_SPACE(state, space) {
    const spaces = [...state.spaces]
    const index = spaces.findIndex((r) => r.id === space.id)
    const found = index > -1

    if (found) {
      Object.assign(spaces[index], space)
    } else {
      spaces.push(space)
    }
    state.spaces = spaces
  },
  REMOVE_SPACE(state, space) {
    state.spaces = state.spaces.filter((s) => s.id !== space.id)
  },
  CLEAR_SPACES(state) {
    state.spaces = []
  },
  CLEAR_PROJECT_SPACES(state) {
    state.spaces = state.spaces.filter((s) => !isProjectSpaceResource(s))
  },
  CLEAR_SPACE_MEMBERS(state) {
    state.spaceMembers = []
  },
  SET_SPACE_MEMBERS(state, members) {
    state.spaceMembers = members
  },
  UPSERT_SPACE_MEMBERS(state, member) {
    // group shares don't have the name prop... distinguish by shareType
    const checkAttr = member.collaborator.name ? 'name' : 'displayName'
    const memberIndex = state.spaceMembers.findIndex((s) => {
      return member.id === s.id && member.collaborator[checkAttr] === s.collaborator[checkAttr]
    })

    if (memberIndex >= 0) {
      state.spaceMembers[memberIndex] = member
    } else {
      // share was not present in the list while updating, add it instead
      state.spaceMembers.push(member)
    }
  },
  REMOVE_SPACE_MEMBER(state, member) {
    // group shares don't have the name prop... distinguish by shareType
    const checkAttr = member.collaborator.name ? 'name' : 'displayName'
    state.spaceMembers = state.spaceMembers.filter(
      (s) => member.id === s.id && member.collaborator[checkAttr] !== s.collaborator[checkAttr]
    )
  }
}

const actions = {
  async loadSpaces(context, { graphClient }: { graphClient: Graph }) {
    context.commit('SET_SPACES_LOADING', true)
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
        loadSpacesByType({ graphClient, driveType: 'personal' }),
        loadSpacesByType({ graphClient, driveType: 'project' })
      ])
      context.commit('ADD_SPACES', [...personalSpaces, ...projectSpaces])
      context.commit('SET_SPACES_INITIALIZED', true)
    } finally {
      context.commit('SET_SPACES_LOADING', false)
    }
  },
  async loadMountPoints(context, { graphClient }: { graphClient: Graph }) {
    // fetching mount points is particularly expensive, so we do that only on first access.
    if (context.getters.mountPointsInitialized) {
      return
    }
    try {
      const mountPointSpaces = await loadSpacesByType({ graphClient, driveType: 'mountpoint' })
      context.commit('ADD_SPACES', mountPointSpaces)
    } finally {
      context.commit('SET_MOUNT_POINTS_INITIALIZED', true)
    }
  },
  async reloadProjectSpaces(context, { graphClient }) {
    const projectSpaces = await loadSpacesByType({ graphClient, driveType: 'project' })
    context.commit('CLEAR_PROJECT_SPACES')
    context.commit('ADD_SPACES', projectSpaces)
  },
  async loadSpaceMembers(
    context,
    { graphClient, space }: { graphClient: Ref<Graph>; space: SpaceResource }
  ) {
    context.commit('CLEAR_SPACE_MEMBERS')
    const promises = []
    const spaceShares = []

    for (const role of Object.keys(space.spaceRoles)) {
      for (const { kind, id, expirationDate } of space.spaceRoles[role]) {
        const client = unref(graphClient)
        let prom: Promise<AxiosResponse>
        switch (kind) {
          case 'user':
            prom = client.users.getUser(id)
            break
          case 'group':
            prom = client.groups.getGroup(id)
            break
          default:
            continue
        }

        prom.then((resolved) => {
          spaceShares.push(
            buildSpaceShare({ ...resolved.data, role, kind, expirationDate }, space.id)
          )
        })

        promises.push(prom)
      }
    }

    await Promise.allSettled(promises)
    context.commit('SET_SPACE_MEMBERS', sortSpaceMembers(spaceShares))
  },
  async addSpaceMember(
    context,
    {
      client,
      graphClient,
      path,
      shareWith,
      permissions,
      role,
      storageId,
      displayName,
      shareType,
      expirationDate
    }
  ) {
    await client.shares.shareSpace(path, shareWith, shareType, storageId, {
      permissions,
      role: role.name,
      expirationDate
    })
    const graphResponse = await graphClient.drives.getDrive(storageId)
    context.commit('UPSERT_SPACE', buildSpace(graphResponse.data))
    const shareObj = {
      role: role.name,
      onPremisesSamAccountName: shareWith,
      displayName,
      expirationDate,
      share_type: shareType
    }
    context.commit('UPSERT_SPACE_MEMBERS', buildSpaceShare(shareObj, storageId))
  },
  async changeSpaceMember(
    context,
    { client, graphClient, share, permissions, expirationDate, role }
  ) {
    await client.shares.shareSpace(
      '',
      share.collaborator.name || share.collaborator.displayName,
      share.shareType,
      share.id,
      {
        permissions,
        role: role.name,
        expirationDate
      }
    )

    const graphResponse = await graphClient.drives.getDrive(share.id)
    context.commit('UPSERT_SPACE', buildSpace(graphResponse.data))
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

    context.commit('UPSERT_SPACE_MEMBERS', spaceShare)
  },
  async deleteSpaceMember(context, { client, graphClient, share, reloadSpace = true }) {
    const additionalParams = {
      shareWith: share.collaborator.name || share.collaborator.displayName
    } as any
    await client.shares.deleteShare(share.id, additionalParams)

    if (reloadSpace) {
      const graphResponse = await graphClient.drives.getDrive(share.id)
      context.commit('UPSERT_SPACE', buildSpace(graphResponse.data))
    }

    context.commit('REMOVE_SPACE_MEMBER', share)
  }
}

const loadSpacesByType = async ({
  graphClient,
  driveType
}: {
  graphClient: Graph
  driveType: string
}): Promise<SpaceResource[]> => {
  const graphResponse = await graphClient.drives.listMyDrives(
    'name asc',
    `driveType eq ${driveType}`
  )
  if (!graphResponse.data) {
    return []
  }
  return graphResponse.data.value.map((space) =>
    driveType === 'mountpoint'
      ? buildMountPointSpaceResource({ ...space, serverUrl: configurationManager.serverUrl })
      : buildSpace({ ...space, serverUrl: configurationManager.serverUrl })
  )
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
