import { DavProperty } from 'web-client/src/webdav/constants'
import { getParentPaths } from 'web-pkg/src/helpers/path'
import { AncestorMetaData } from 'web-pkg/src/types'

const state = {
  ancestorMetaData: {}
}

const getters = {
  ancestorMetaData: (state) => {
    return state.ancestorMetaData
  }
}

const mutations = {
  SET_ANCESTOR_META_DATA(state, value) {
    state.ancestorMetaData = value
  },

  UPDATE_ANCESTOR_FIELD(state, params) {
    const resource = state.ancestorMetaData[params.path] ?? null
    if (resource) {
      resource[params.field] = params.value
    }
  }
}

const actions = {
  loadAncestorMetaData({ commit, state }, { space, path, client }) {
    const ancestorMetaData: AncestorMetaData = {}
    const promises = []
    const davProperties = [DavProperty.FileId, DavProperty.ShareTypes, DavProperty.FileParent]

    path = path || '/'
    if (!state.ancestorMetaData[path]) {
      promises.push(
        client.listFiles(space, { path }, { depth: 0, davProperties }).then(({ resource }) => {
          ancestorMetaData[path] = {
            id: resource.fileId,
            shareTypes: resource.shareTypes,
            parentFolderId: resource.parentFolderId,
            spaceId: space.id,
            path
          }
        })
      )
    }

    const parentPaths = getParentPaths(path)

    for (const parentPath of parentPaths) {
      const cachedData = state.ancestorMetaData[parentPath] ?? null
      if (cachedData?.spaceId === space.id) {
        ancestorMetaData[parentPath] = cachedData
        continue
      }

      promises.push(
        client
          .listFiles(space, { path: parentPath }, { depth: 0, davProperties })
          .then(({ resource }) => {
            ancestorMetaData[parentPath] = {
              id: resource.fileId,
              shareTypes: resource.shareTypes,
              parentFolderId: resource.parentFolderId,
              spaceId: space.id,
              path: parentPath
            }
          })
      )
    }

    return Promise.allSettled(promises).then(() => {
      commit('SET_ANCESTOR_META_DATA', ancestorMetaData)
    })
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
