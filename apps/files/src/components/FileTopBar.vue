<template>
  <v-layout class="primary lighten-2 fill-height" pa-0 row>
    <v-btn v-if="!createFile" @click="createFolder ? addNewFolder(newFolderName) : createFolder = !createFolder" flat>
      <v-icon color="white" v-if="!createFolder" large>create_new_folder</v-icon>
      <v-icon color="white" v-if="createFolder" large>add</v-icon>
    </v-btn>
    <v-btn v-if="!createFolder" @click="createFile ? addNewFile(newFileName, item) : createFile = !createFile" flat>
      <v-icon color="white" v-if="!createFile" large>file_copy</v-icon>
      <v-icon color="white" v-if="createFile" large>add</v-icon>
    </v-btn>
    <v-flex v-if="createFolder || createFile" xs2>
      <v-text-field
      v-if="createFolder"
      @keydown.enter="addNewFolder(newFolderName)"
      :placeholder="$gettext('Enter foldername here')"
      v-model="newFolderName"
      hide-details
      single-line
      ></v-text-field>
      <v-text-field
      v-if="createFile"
      @keydown.enter="addNewFile(newFileName)"
      :placeholder="$gettext('Enter filename here')"
      v-model="newFileName"
      hide-details
      single-line
      ></v-text-field>
    </v-flex>
    <v-flex align-self-center>
      <file-upload :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError"></file-upload>
    </v-flex>
    <v-flex align-self-center>
      <v-breadcrumbs class="pa-0" :items="activeRoute">
        <template slot="item" slot-scope="props">
          <drop >
            <v-icon color="white" @click="navigateTo('files-list', props.item.route)" v-if="props.item.text === 'home'" large>
              home
            </v-icon>
            <span @click="navigateTo('files-list', props.item.route)" v-else class="heading font-weight-bold">
              {{ props.item.text }}
            </span>
          </drop>
        </template>
      </v-breadcrumbs>
    </v-flex>
    <v-flex slot="extension" align-self-center class="text-xs-right" xs1>
      <span>
        <translate :translate-n="filteredFiles.length" translate-plural="%{ filteredFiles.length } Results">
          %{ filteredFiles.length } Result
        </translate>
      </span>
    </v-flex>
    <v-menu slot="extension" transition="scale-transition">
      <v-btn slot="activator" flat><v-icon color="white" large>filter_list</v-icon></v-btn>
      <v-list>
        <v-list-tile v-for="(filter, fid) in filters" :key="fid">
          <v-list-tile-title v-text="filter.name"></v-list-tile-title>
          <v-checkbox v-model="filter.value"></v-checkbox>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-layout>
</template>
<script>
import FileUpload from './FileUpload.vue'
import { filter, includes } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  components: {
    FileUpload
  },
  data: () => ({
    filters: [
      {
        name: 'Files',
        tag: 'file',
        value: true
      }, {
        name: 'Folders',
        tag: 'folder',
        value: true
      }, {
        name: 'Hidden',
        tag: 'hidden',
        value: false
      }
    ],
    createFolder: false,
    createFile: false,
    newFolderName: '',
    newFileName: '',
    url: '',
    headers: {},
    onFileSuccess: '',
    onFileError: '',
  }),
  methods: {
    ifFiltered (item) {
      for (let filter of this.filters) {
        if (item.type === filter.tag) {
          return filter.value
        } else if (item.name.startsWith('.')) {
          return this.filters[2].value
        }
      }
    },
    getRoutes () {
      this.breadcrumbs = []
      let breadcrumb = {}
      let absolutePath = this.$route.params.item
      let pathSplit = absolutePath.split('/').filter((val) => val)
      if (!includes(pathSplit, 'home')) {
        breadcrumb.text = 'home'
        breadcrumb.route = breadcrumb.text
        this.breadcrumbs.push(breadcrumb)
        breadcrumb = {}
      }
      for (let i = 0; i < pathSplit.length; i++) {
        breadcrumb.text = pathSplit.slice(0, i + 1)[i]
        breadcrumb.route = '/' + pathSplit.slice(0, i + 1).join('/')
        this.breadcrumbs.push(breadcrumb)
        breadcrumb = {}
      }
      return this.breadcrumbs
    },
    addNewFile (fileName, path) {
      this.createFile = !this.createFile
      if (fileName !== '') {
        if (path === 'home') {
          path = '/'
        }
        console.log('addNewFile', fileName, 'pathToAddto', path)
      }
    },

    addNewFolder (folderName) {
      this.createFolder = !this.createFolder
      if (folderName !== '') {
        this.createFolder = !this.createFolder
        this.$client.files.createFolder(((this.item === 'home') ? '' : this.item) + '/' + folderName)
          .then(() => {
            this.newFolderName = ''
          })
          .catch(console.error)
      }
    },
  },
  computed: {
    ...mapGetters('Files',['files']),
    activeRoute () {
      return this.getRoutes()
    },
    item () {
      return this.$route.params.item
    },
    filteredFiles () {
      return filter(this.files, (file) => {
        return this.ifFiltered(file)
      })
    }
  }
}
</script>
<style>
.v-toolbar__extension{
  padding: 0!important;
}
</style>
