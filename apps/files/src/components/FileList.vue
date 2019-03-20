<template>
  <oc-table middle divider class="oc-filelist">
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell shrink type="head">
          <oc-checkbox class="uk-margin-small-left" @click.native="toggleAll" :checked="all" />
        </oc-table-cell>
        <oc-table-cell shrink />
        <oc-table-cell type="head" class="uk-text-truncate" v-text="'Name'"/>
        <oc-table-cell shrink type="head" v-text="'Size'"/>
        <oc-table-cell shrink type="head" class="uk-text-nowrap uk-visible@s" v-text="'Modification Time'"/>
        <oc-table-cell shrink type="head" v-text="'Actions'"/>
      </oc-table-row>
    </oc-table-group>
    <oc-table-group>
      <oc-table-row v-for="(item, index) in fileData" :key="index">
        <oc-table-cell>
          <oc-checkbox class="uk-margin-small-left" @change.native="$emit('toggle', item)" :model="selection[index]" />
        </oc-table-cell>
        <oc-table-cell class="uk-padding-remove">
          <oc-star class="uk-display-block" style="cursor:pointer" @click.native="toggleFileFavorite(item)" :shining="item.starred" />
        </oc-table-cell>
        <oc-table-cell>
          <oc-file @click.native="item.extension === false ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)" :file="item" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          {{ item.size | fileSize }}
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap uk-visible@s">
          {{ item.mdate | formDateFromNow }}
        </oc-table-cell>
        <oc-table-cell>
          <div class="uk-button-group uk-margin-small-right">
            <oc-button v-for="(action, index) in actions" :key="index" @click.native="action.handler(item, action.handlerData)" :disabled="!action.isEnabled(item)" :icon="action.icon" aria-label="Edit Picture" />
          </div>
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
  </oc-table>
</template>
<script>
import { includes } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import Mixins from '../mixins'

export default {
  mixins: [Mixins],
  name: 'FileList',
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled'],
  methods: {
    ...mapActions('Files', ['markFavorite', 'resetFileSelection', 'addFileSelection', 'removeFileSelection', 'deleteFiles', 'renameFile']),
    ...mapActions(['openFile']),

    toggleAll () {
      if (this.selectedFiles.length) {
        this.resetFileSelection()
      } else {
        let selectedFiles = this.fileData.slice()
        for (let item of selectedFiles) {
          if (!includes(this.selectedFiles, item)) {
            this.addFileSelection(item)
          }
        }
      }
    },
    toggleFileFavorite (item) {
      this.markFavorite({
        client: this.$client,
        file: item
      })
    },
    getBaseDirectory (filePath) {
      return filePath.match(/^(.*[/])/)[0].slice(0, -1)
    },
    openFileActionBar (file) {
      this.$emit('FileAction', file)
    },
    openSideBar (file, sideBarName) {
      this.$emit('sideBarOpen', file, sideBarName)
    },
    dropExtension (name, extension) {
      if (!extension) {
        return name
      }
      return name.substring(0, name.length - extension.length - 1)
    },
    promptChangeName (item) {
      this.$uikit.modal.prompt('Rename File/Folder', item.name).then((d) => {
        this.newName = d;
        this.changeFileName = true;
      });
    },
    confirmDeleteFile (item) {
      let message = this.$gettextInterpolate('Please confirm the deletion of %{file}', { file: item.name })

      this.$uikit.modal.confirm(message).then((d) => {
        console.log(`removing ${item.name}`);
        this.reallyDeleteFile(item)
      }, () => {
        console.log(`keeping ${item.name}`);
      });
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles', 'atSearchPage']),
    ...mapGetters(['getToken', 'fileSideBars']),
    all () {
      return this.selectedFiles.length === this.fileData.length
    },
    selection () {
      return this.fileData.map((file) => {
        return includes(this.selectedFiles, file)
      })
    },
    actions () {
      let actions = [
        { icon: 'edit',
          handler: this.promptChangeName,
          isEnabled: function (item) {
            return true
          } },
        { icon: 'file_download',
          handler: this.downloadFile,
          isEnabled: function (item) {
            return item.canDownload()
          } },
        { icon: 'delete',
          handler: this.confirmDeleteFile,
          isEnabled: function (item) {
            return item.canBeDeleted()
          } }
      ]
      for (let sideBarName in this.fileSideBars) {
        let sideBar = this.fileSideBars[sideBarName]
        if (sideBar.quickAccess) {
          actions.push({ icon: sideBar.quickAccess.icon,
            handler: this.openSideBar,
            handlerData: sideBarName,
            isEnabled: function (item) {
              return true
            }
          })
        }
      }

      return actions
    }
  }
}

</script>
