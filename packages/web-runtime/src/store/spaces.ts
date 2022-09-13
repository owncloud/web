import { buildSpace } from 'web-client/src/helpers'
import Vue from 'vue'
import { set, has } from 'lodash-es'
import { unref } from '@vue/composition-api'
import { buildSpaceShare } from 'files/src/helpers/resources'
import { sortSpaceMembers } from 'files/src/helpers/space'

const state = {
  spaces: [],
  spaceMembers: [],
  spaceMembersLoading: false
}

const getters = {
  spaces: (state) => state.spaces,
  spaceMembers: (state) => state.spaceMembers,
  spaceMembersLoading: (state) => state.spaceMembersLoading
}

const mutations = {
  LOAD_SPACES(state, spaces) {
    state.spaces = spaces
  },
  /**
   * Updates a single space field. If the space with given id doesn't exist nothing will happen.
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

    Vue.set(spaceSource, index, newResource)
  },
  UPSERT_SPACE(state, space) {
    const spaces = [...state.spaces]
    const index = spaces.findIndex((r) => r.id === space.id)
    const found = index > -1

    if (found) {
      spaces.splice(index, 1, space)
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
  LOAD_CURRENT_SPACE_MEMBERS(state, members) {
    state.spaceMembers = members
  },
  CURRENT_SPACE_MEMBERS_LOADING(state, loading) {
    state.spaceMembersLoading = loading
  },
  CURRENT_SPACE_MEMBERS_UPSERT(state, member) {
    const fileIndex = state.spaceMembers.findIndex((s) => {
      return member.id === s.id && member.collaborator.name === s.collaborator.name
    })

    if (fileIndex >= 0) {
      Vue.set(state.spaceMembers, fileIndex, member)
    } else {
      // share was not present in the list while updating, add it instead
      state.spaceMembers.push(member)
    }
  },
  CURRENT_SPACE_MEMBER_REMOVE(state, member) {
    state.spaceMembers = state.spaceMembers.filter(
      (s) => member.id === s.id && member.collaborator.name !== s.collaborator.name
    )
  }
}

const actions = {
  async loadSpaces(context, { graphClient }) {
    const graphResponse = await graphClient.drives.listMyDrives()
    if (!graphResponse.data) {
      return
    }

    const spaces = graphResponse.data.value.map((space) => buildSpace(space))
    context.commit('LOAD_SPACES', spaces)
  },
  loadCurrentSpaceMembers(context, { graphClient, space }) {
    context.commit('LOAD_CURRENT_SPACE_MEMBERS', [])
    context.commit('CURRENT_SPACE_MEMBERS_LOADING', true)
    const promises = []
    const spaceShares = []

    for (const role of Object.keys(space.spaceRoles)) {
      for (const userId of space.spaceRoles[role]) {
        promises.push(
          unref(graphClient)
            .users.getUser(userId)
            .then((resolved) => {
              spaceShares.push(buildSpaceShare({ ...resolved.data, role }, space.id))
            })
        )
      }
    }

    return Promise.all(promises).then(() => {
      context.commit('LOAD_CURRENT_SPACE_MEMBERS', sortSpaceMembers(spaceShares))
      context.commit('CURRENT_SPACE_MEMBERS_LOADING', false)
    })
  },
  addSpaceMember(context, { client, path, shareWith, permissions, role, storageId, displayName }) {
    context.commit('CURRENT_SPACE_MEMBERS_LOADING', true)
    return client.shares
      .shareSpaceWithUser(path, shareWith, storageId, { permissions, role: role.name })
      .then(() => {
        const shareObj = { role: role.name, onPremisesSamAccountName: shareWith, displayName }
        context.commit('CURRENT_SPACE_MEMBERS_UPSERT', buildSpaceShare(shareObj, storageId))
      })
  },
  changeSpaceMember(context, { client, share, permissions, role }) {
    context.commit('CURRENT_SPACE_MEMBERS_LOADING', true)
    return client.shares
      .shareSpaceWithUser('', share.collaborator.name, share.id, { permissions, role: role.name })
      .then(() => {
        const spaceShare = buildSpaceShare(
          {
            role: role.name,
            onPremisesSamAccountName: share.collaborator.name,
            displayName: share.collaborator.displayName
          },
          share.id
        )

        context.commit('CURRENT_SPACE_MEMBERS_UPSERT', spaceShare)
        context.commit('CURRENT_SPACE_MEMBERS_LOADING', false)
      })
  },
  deleteSpaceMember(context, { client, share }) {
    context.commit('CURRENT_SPACE_MEMBERS_LOADING', true)
    const additionalParams = { shareWith: share.collaborator.name } as any

    return client.shares.deleteShare(share.id, additionalParams).then(() => {
      context.commit('CURRENT_SPACE_MEMBER_REMOVE', share)
      context.commit('CURRENT_SPACE_MEMBERS_LOADING', false)
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
