<template>
  <v-data-table
  id="filesTable"
  v-model="selectedFiles"
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
        primary
        hide-details
        color="yellow"
        on-icon="star"
        off-icon="star_border"></v-checkbox>
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
    </template>
    <template slot="items" slot-scope="props">
      <tr :active="props.selected">
        <td v-if="disableColumn('checkbox')">
          <v-checkbox
          @change="$emit('toggle', props.item)"
          :input-value="props.selected"
          primary
          hide-details></v-checkbox>
        </td>
        <td v-if="disableColumn('stars')">
          <v-checkbox
          @change="toggleFileFavorite(props.item)"
          :input-value="props.item.starred"
          primary
          hide-details
          color="yellow"
          on-icon="star" off-icon="star_border" large></v-checkbox>
        </td>
        <td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-left ellipsis" style="max-width: 310px">
          {{ props.item.name }}
        </td>
        <td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-center">
          {{ props.item.size | fileSize }}
        </td>
        <td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-center">
          {{ props.item.mdate | formDateFromNow }}
        </td>
      </tr>
    </template>
    <template slot="pageText" slot-scope="props">
      <span>Item</span> {{ props.pageStart }} - {{ props.pageStop }} <span>of</span> {{ props.itemsLength }}
    </template>
  </v-data-table>
</template>
<script>

import { includes } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import Mixins from '../mixins'

export default {
  mixins: [
    Mixins
  ],
  name: 'DirTable',
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled'],
  data: () => ({
    columnsDisabled: {
      favorite: false,
      fileSelect: false,
      data: false,
    },
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Size', value: 'size' },
      { text: 'Date', value: 'date' },
    ],
    pagination: {
      sortBy: 'name'
    }
  }),
  methods: {
    ...mapActions('Files', ['markFavorite', 'resetFileSelection', 'addFileSelection', 'removeFileSelection']),
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
    disableColumn (column) {
      if (column === 'stars') {
        this.columnsDisabled.favorite = this.starsEnabled !== false
        return this.columnsDisabled.favorite
      } else if (column === 'checkbox') {
        this.columnsDisabled.fileSelect = this.checkboxEnabled !== false
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
    openFileActionBar (file) {
      this.$emit('FileAction', file)
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles'])

  }
}

</script>
