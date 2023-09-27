import {
  SpaceResource,
  extractStorageId,
  isMountPointSpaceResource,
  isProjectSpaceResource
} from 'web-client/src/helpers'
import { DavProperty } from 'web-client/src/webdav/constants'
import { configurationManager } from '@ownclouders/web-pkg'
import { getParentPaths } from '@ownclouders/web-pkg'
import { AncestorMetaData } from '@ownclouders/web-pkg'

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
    const spaces = rootGetters['runtime/spaces/spaces'] as SpaceResource[]

    const getMountPoints = () =>
      spaces.filter(
        (s) =>
          isMountPointSpaceResource(s) && extractStorageId(s.root.remoteItem.rootId) === space.id
      )

    let fullyAccessibleSpace = true
    if (configurationManager.options.routing.fullShareOwnerPaths) {
      // keep logic in sync with "isResourceAccessible" from useGetMatchingSpace
      const projectSpace = spaces.find((s) => isProjectSpaceResource(s) && s.id === space.id)
      fullyAccessibleSpace =
        space.isOwner(rootGetters.user) || projectSpace?.isMember(rootGetters.user)
    }

    for (const path of parentPaths) {
      const cachedData = state.ancestorMetaData[path] ?? null
      if (cachedData?.spaceId === space.id) {
        ancestorMetaData[path] = cachedData
        continue
      }

      // keep logic in sync with "isResourceAccessible" from useGetMatchingSpace
      if (
        !fullyAccessibleSpace &&
        !getMountPoints().find((m) => path.startsWith(m.root.remoteItem.path))
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
