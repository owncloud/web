<template>
  <v-navigation-drawer
  v-model="drawer"
  class="grey lighten-2"
  right
  floating
  permanent
  height="85vh"
  >
  <v-layout column>
    <v-layout primary row>
      <v-flex>
        <v-icon color="white" class="pl-4" medium>folder</v-icon>
      </v-flex>
      <v-flex white--text align-self-center>
        <span class="subheading" v-translate> {{ getTabName }} </span>
      </v-flex>
    </v-layout>
    <v-layout primary row>
      <v-spacer />
      <v-btn flat><v-icon color="white" medium>delete</v-icon></v-btn>
      <v-spacer />
      <v-btn v-if="items.length <= 1" flat><v-icon color="white" medium>cloud_download</v-icon></v-btn>
      <v-btn disabled v-else flat><v-icon color="white" medium>archive</v-icon></v-btn>
      <v-spacer />
    </v-layout>
    <v-tabs
    v-model="active"
    color="primary lighten-5"
    dark
    slider-color="yellow"
    >
    <v-tab
    v-for="tab of registeredTabs"
    :key="tab.name"
    ripple
    >
    {{ tab.name }}
  </v-tab>
  <v-tab-item
  v-for="tab of registeredTabs"
  :key="tab.name"
  >
  <v-layout v-if="items.length <= 1" column>
    <v-layout row>
      <v-list-tile
      v-for="tile in items"
      :key="tile.id"
      >
      <v-list-tile-avatar>
        <v-icon large>folder</v-icon>
      </v-list-tile-avatar>

      <v-list-tile-title>{{ tile.name }}</v-list-tile-title>
      <v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
    </v-list-tile>
  </v-layout>
</v-layout>
<v-layout v-else column>
  <v-layout row>
    <v-flex>
      <span class="content text-xs-center">{{ items.length }} Items selected.</span>
    </v-flex>
    <v-spacer />
    <v-flex>
      <span class="content text-xs-right">Total Size: {{ accumulatedFilesSize | fileSize }}</span>
    </v-flex>
  </v-layout>
  <v-layout column>
    <v-list-tile
    v-for="tile in items"
    :key="tile.id"
    >
    <v-list-tile-avatar>
      <v-icon large>folder</v-icon>
    </v-list-tile-avatar>

    <v-list-tile-title>{{ tile.name }}</v-list-tile-title>
    <v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
  </v-list-tile>
</v-layout>
</v-layout>
</v-tab-item>
</v-tabs>
</v-layout>
</v-navigation-drawer>
</template>

<script>
import Mixins from '../mixins'
import { reduce } from 'lodash'

export default {
  mixins: [Mixins],
  props: ['items'],
  name: 'FileDetails',
  data () {
    return {
      drawer: false,
      tabName: '',
      active: this.getLength,
      registeredTabs: [
        {
          app: 'files',
          name: 'Files',
          componentPath: 'OcSidebar.vue'
        }
      ]
    }
  },
  components: {
  },
  methods: {
    close () {
      this.$emit('reset')
    }
  },
  computed: {
    getLength () {
      return this.items.length
    },
    getTabName () {
      let n = (this.items.length > 1) ? 'Multiple Files' : this.items[0].name
      // this.tabName = n
      return n
    },
    accumulatedFilesSize () {
      let size = reduce(this.items, (sum, n) => {
        return sum + n.size
      }, 0)
      return size
    }
  }
}
</script>
