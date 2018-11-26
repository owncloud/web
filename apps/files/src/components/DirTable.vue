<template>
  <v-data-table
    id="filesTable"
    v-model="selected"
    :headers="headers"
    :items="fileData"
    :pagination.sync="pagination"
    select-all
    item-key="name"
    class="elevation-1">
    <template slot="headers" slot-scope="props">
        <th v-if="disableColumn('checkbox')" >
          <v-checkbox
            :input-value="props.all"
            :indeterminate="props.indeterminate"
            primary
            hide-details
            @click.native="toggleAll"
          ></v-checkbox>
        </th>
        <th v-if="disableColumn('stars')">
          <v-checkbox
          primary	hide-details
          color="yellow"
          on-icon="star" off-icon="star_border"></v-checkbox>
        </th>
        <th
          v-for="header in props.headers"
          :key="header.text"
          :class="[header.text === 'Name' ? 'text-xs-left' : 'text-xs-center' , 'column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          @click="changeSort(header.value)"
        >
          <v-icon small>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template>
    <template slot="items" slot-scope="props">
      <tr :active="props.selected">
          <td v-if="disableColumn('checkbox')">
            <v-checkbox @change="$emit('toggle', props.item)" :input-value="props.selected" primary	hide-details>
            </v-checkbox>
          </td>
          <td v-if="disableColumn('stars')">
            <v-checkbox
            @change="toggleFileFavorite(props.item)"
            :input-value="props.item.starred"
            primary	hide-details
            color="yellow"
            on-icon="star" off-icon="star_border" large></v-checkbox>
          </td>
          <td @click="props.item.extension === false ? navigateTo('file-list', props.item.path) : openFile(props.item)" class="text-xs-left">
            {{ props.item.name }}
          </td>
          <td @click="props.item.extension === false ? navigateTo('file-list', props.item.path) : openFile(props.item)" class="text-xs-center">
            {{ props.item.size | fileSize }}
          </td>
          <td @click="props.item.extension === false ? navigateTo('file-list', props.item.path) : openFile(props.item)" class="text-xs-center">
            {{ props.item.mdate | formDateFromNow }}
          </td>
          <td @click="props.item.extension === false ? navigateTo('file-list', props.item.path) : openFile(props.item)" class="text-xs-center">
            {{ props.item.owner }}
          </td>
      </tr>
    </template>
    <template slot="pageText" slot-scope="props">
      <span>Item</span> {{ props.pageStart }} - {{ props.pageStop }} <span>of</span> {{ props.itemsLength }}
    </template>
  </v-data-table>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'

export default {
  mixins:[
    Mixins
  ],
  name: 'DirTable',
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled', 'ownerEnabled'],
  data: () => ({
    selected: [],
    columnsDisabled: {
      favorite: false,
      fileSelect: false,
      data: false,
      owner: false
    },
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Size', value: 'size' },
      { text: 'Date', value: 'date' },
      { text: 'Owner', value: 'owner' }
    ],
    pagination: {
      sortBy: 'name'
    }
  }),
  methods: {
    ...mapActions('files',['markFavorite']),

    toggleAll () {
      if (this.selected.length) {
        for(let item of this.selectedFiles){
          this.removeFileSelection(item)
        }
        this.selected = []
      }
      else {
        this.selected = this.items.slice()
        for (let item of this.selected) {
          if(!_includes(this.selectedFiles, item)){
            this.addFileSelection(item)
          }
        }
      }
    },

    toggleFileFavorite(item) {
      console.log(item)
        this.markFavorite({
          client: this.$client,
          file: item
        })
    },

    disableColumn (column) {
      if(column === 'stars') {
        this.columnsDisabled.favorite = this.starsEnabled === false ? false : true
        return this.columnsDisabled.favorite
      }
      else if(column === 'checkbox') {
        this.columnsDisabled.fileSelect = this.checkboxEnabled === false ? false : true
        return this.columnsDisabled.fileSelect
      }
      return true
    },
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },


    openFile (file) {
      this.sheet = true
      let files = file.name.split('/')
      let myFile = files.slice(-1)

      this.fileAction = file
    }
  },
  computed: {
    ...mapGetters('files',['slectedFiles']),


  }
}

</script>
