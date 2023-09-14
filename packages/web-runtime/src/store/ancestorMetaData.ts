import { join } from 'path'
import { Resource, SpaceResource } from 'web-client/src'
import { WebDAV } from 'web-client/src/webdav'
import { DavProperty } from 'web-client/src/webdav/constants'
import { AncestorMetaData, AncestorMetaDataValue } from 'web-pkg/src/types'

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
    { commit, state, rootGetters },
    {
      space,
      path,
      client,
      fileId,
      fullShareOwnerPaths
    }: {
      space: SpaceResource
      path: string
      client: WebDAV
      fileId: string
      fullShareOwnerPaths: boolean
    }
  ) {
    const davProperties = [
      DavProperty.FileId,
      DavProperty.ShareTypes,
      DavProperty.FileParent,
      DavProperty.Name
    ]

    const loadMetaDataValue = async (fileId: string): Promise<AncestorMetaDataValue> => {
      const cachedData = (state.ancestorMetaData as AncestorMetaData)[fileId]
      if (cachedData) {
        return { ...cachedData }
      }

      // if we have no fileId, we query by path - after the first request we have a fileId
      const options = {
        ...(fileId && { fileId }),
        ...(!fileId && path && { path })
      }

      const currentFiles: Resource[] = rootGetters['Files/filesAll']
      let resource = currentFiles.find(({ id }) => fileId === id)

      if (!resource) {
        resource = (await client.listFiles(space, options, { depth: 0, davProperties })).resource
      }

      const value = {
        id: resource.fileId,
        shareTypes: resource.shareTypes,
        parentFolderId: resource.parentFolderId,
        spaceId: space.id.toString(),
        name: resource.name,
        path: ''
      }
      return value
    }

    const ancestorMetaData: AncestorMetaData = {}
    const ancestorList = [] as AncestorMetaDataValue[]

    let value: AncestorMetaDataValue
    let lastValue: AncestorMetaDataValue
    do {
      try {
        lastValue = value
        value = await loadMetaDataValue(value?.parentFolderId || fileId)
        ancestorMetaData[value.id] = value
        ancestorList.unshift(value)
      } catch (e) {
        value = null
        ancestorMetaData[lastValue.id].parentFolderId = null
      }
    } while (value && value.parentFolderId !== value.spaceId && value.parentFolderId !== null)

    if (!fullShareOwnerPaths) {
      ancestorList[0].path =
        ancestorList[0].parentFolderId === null ? `/${ancestorList[0].name}` : `/`
    } else {
      ancestorList[0].path = path
    }
    for (let i = 1; i < ancestorList.length; i++) {
      ancestorList[i].path = join(ancestorList[i - 1].path, ancestorList[i].name)
    }

    console.log('ancestorList', path, ancestorList, fullShareOwnerPaths)

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
