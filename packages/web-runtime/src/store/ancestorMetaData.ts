import { isMountPointSpaceResource } from 'web-client/src/helpers'
import { DavProperty } from 'web-client/src/webdav/constants'
import { configurationManager } from 'web-pkg/src'
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
  loadAncestorMetaData({ commit, state, rootGetters }, { folder, space, client }) {
    const ancestorMetaData: AncestorMetaData = {
      [folder.path]: {
        id: folder.fileId,
        shareTypes: folder.shareTypes,
        parentFolderId: folder.parentFolderId,
        spaceId: space.id,
        path: folder.path
      }
    }
    const promises = []
    const davProperties = [DavProperty.FileId, DavProperty.ShareTypes, DavProperty.FileParent]
    const parentPaths = getParentPaths(folder.path)
    const mountPoints = rootGetters['runtime/spaces/spaces'].filter(isMountPointSpaceResource)

    for (const path of parentPaths) {
      const cachedData = state.ancestorMetaData[path] ?? null
      if (cachedData?.spaceId === space.id) {
        ancestorMetaData[path] = cachedData
        continue
      }

      if (
        configurationManager.options.routing.fullShareOwnerPaths &&
        !mountPoints.find((m) => path.startsWith(m.root.remoteItem.path))
      ) {
        // no access to the parent resource
        break
      }

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

    return Promise.all(promises).then(() => {
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
