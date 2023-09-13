import { join } from 'path'
import { SpaceResource } from 'web-client/src'
import { WebDAV } from 'web-client/src/webdav'
import { DavProperty } from 'web-client/src/webdav/constants'
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
    const resource = state.ancestorMetaData[params.id] ?? null
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
      path,
      client,
      fileId
    }: { space: SpaceResource; path: string; client: WebDAV; fileId: string }
  ) {
    const davProperties = [
      DavProperty.FileId,
      DavProperty.ShareTypes,
      DavProperty.FileParent,
      DavProperty.Name
    ]

    const loadMetaDataValue = async (fileId: string) => {
      const options = {
        ...(fileId && { fileId }),
        ...(!fileId && path && { path })
      }

      const { resource } = await client.listFiles(space, options, { depth: 0, davProperties })
      const value = {
        id: resource.fileId,
        shareTypes: resource.shareTypes,
        parentFolderId: resource.parentFolderId,
        spaceId: space.id.toString(),
        name: resource.name,
        path: ''
      }
      ancestorMetaData[resource.fileId] = value
      return value
    }

    const ancestorMetaData: AncestorMetaData = {}

    let value = await loadMetaDataValue(fileId)
    const ancestorList = [value]
    while (value && value.parentFolderId !== value.spaceId) {
      const lastValue = value
      const cachedData = (state.ancestorMetaData as AncestorMetaData)[value.parentFolderId]
      // FIXME: checking for Boolean(cachedData) should be enough, space id should be contained in the file/folder id
      if (cachedData && cachedData?.spaceId === space.id) {
        value = { ...cachedData }
        ancestorMetaData[lastValue.parentFolderId] = value
        ancestorList.unshift(value)
        continue
      }

      try {
        value = await loadMetaDataValue(value.parentFolderId)
        ancestorMetaData[value.parentFolderId] = value
        ancestorList.unshift(value)
      } catch (e) {
        console.error(e)
        ancestorMetaData[lastValue.id].parentFolderId = null
        break
      }
    }

    ancestorList[0].path =
      ancestorList[0].parentFolderId === null ? `/${ancestorList[0].name}` : `/`
    for (let i = 1; i < ancestorList.length; i++) {
      ancestorList[i].path = join(ancestorList[i - 1].path, ancestorList[i].name)
    }

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
