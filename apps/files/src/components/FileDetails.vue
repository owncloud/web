<template>
  <v-navigation-drawer
  v-model="drawer"
  class="grey lighten-2"
  right
  floating
  permanent
  width="350"
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
      <v-btn @click.native="deleteSelectedFiles" flat><v-icon color="white" medium>delete</v-icon></v-btn>
      <v-spacer />
      <v-btn @click.native="downloadFiles" v-if="items.length <= 1" flat><v-icon color="white" medium>cloud_download</v-icon></v-btn>
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
    v-for="tab of fileSideBars"
    :key="tab.name"
    ripple
    >
    {{ tab.name }}
  </v-tab>
      <v-tab-item
              v-for="tab of fileSideBars"
              :key="tab.name"
      >
        <component :is="tab.component"></component>
      </v-tab-item>
</v-tabs>
</v-layout>
</v-navigation-drawer>
</template>

<script>
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  props: ['items'],
  name: 'FileDetails',
  data () {
    return {
      drawer: false,
      tabName: '',
      active: this.getLength
    }
  },
  components: {
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    close () {
      this.$emit('reset')
    },
    downloadFiles () {
      const url = this.$client.files.getFileUrl(this.items[0].path)
      let anchor = document.createElement('a')

      let headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)

      fetch(url, { headers })
        .then(response => response.blob())
        .then(blobby => {
          let objectUrl = window.URL.createObjectURL(blobby)

          anchor.href = objectUrl
          anchor.download = this.items[0].name
          anchor.click()

          window.URL.revokeObjectURL(objectUrl)
        })
    },
    deleteSelectedFiles () {
      this.deleteFiles({
        client: this.$client,
        files: this.items
      })
    }
  },
  computed: {
    ...mapGetters(['getToken', 'fileSideBars']),

    getLength () {
      return this.items.length
    },
    getTabName () {
      if (this.items.length === 0) {
        return ''
      }
      return (this.items.length > 1) ? 'Multiple Files' : this.items[0].name
    }
  }
}
</script>
