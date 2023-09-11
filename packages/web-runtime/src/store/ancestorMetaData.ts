import { SpaceResource } from 'web-client/src'
import { WebDAV } from 'web-client/src/webdav'
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
  async loadAncestorMetaData(
    { commit, state },
    {
      space,
      path, // TODO: remove?
      client,
      fileId
    }: { space: SpaceResource; path: string; client: WebDAV; fileId: string }
  ) {
    const ancestorMetaData: AncestorMetaData = {}
    const davProperties = [
      DavProperty.FileId,
      DavProperty.ShareTypes,
      DavProperty.FileParent,
      DavProperty.Name
    ]

    const addAncestor = async (fileId: string) => {
      const { resource } = await client.listFiles(
        space,
        { fileId, path },
        { depth: 0, davProperties }
      )
      ancestorMetaData[resource.fileId] = {
        id: resource.fileId,
        shareTypes: resource.shareTypes,
        parentFolderId: resource.parentFolderId,
        spaceId: space.id.toString(),
        name: resource.name
      }
      return resource
    }

    let resource = await addAncestor(fileId)
    while (resource.parentFolderId && resource.parentFolderId !== resource.storageId) {
      const cachedData = state.ancestorMetaData[resource.parentFolderId]
      // TODO: still need the space check?
      if (cachedData?.spaceId === space.id) {
        ancestorMetaData[resource.parentFolderId] = cachedData
        continue
      }
      const oldResource = resource
      try {
        resource = await addAncestor(resource.parentFolderId)
      } catch (e) {
        console.error(e)
        ancestorMetaData[oldResource.fileId].parentFolderId = null
        break
      }
    }

    console.log('ancestorMetaData', ancestorMetaData)
    commit('SET_ANCESTOR_META_DATA', ancestorMetaData)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
