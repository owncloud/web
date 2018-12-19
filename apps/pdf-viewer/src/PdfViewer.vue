<template lang="html">
  <div>
    <v-toolbar fixed>
      <v-icon>ocft icon-application-pdf</v-icon>
      <v-toolbar-title>{{ filePath }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="!loading">
        <input v-model.number="page" type="number" style="width: 5em"> /{{numPages}}
      </div>
      <v-btn icon @click="closeApp">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <pdf v-if="!loading" :page="page" @error="error" @num-pages="numPages = $event" :src="content"></pdf>
  </div>
</template>
<script>
import pdf from 'vue-pdf'
import { mapGetters } from 'vuex'

export default {
  name: 'PdfViewer',
  mounted() {
    if (this.filePath === '') {
      this.closeApp()
      return
    }
    const url = this.$client.files.getFileUrl(this.filePath)

    let headers = new Headers()
    headers.append('Authorization', 'Bearer ' + this.getToken)

    fetch(url, {headers})
      .then(response => {
        return response.blob()
      })
      .then(blob => {
        this.content = window.URL.createObjectURL(blob)
      })
  },
  components: {
    pdf
  },
  data: () => ({
    content: '',
    numPages: 0,
    page: 1
  }),
  computed: {
    ...mapGetters(['getToken', 'showNotification']),
    filePath() {
      // TODO use mapGetters if babel exists
      return this.$store.state.apps.file.path
    },
    loading() {
      return this.content === ''
    }
  },
  methods: {
    closeApp() {
      this.$router.push({
        path: '/files/list/home'
      })
    },
    error(error) {
      this.showNotification({
        title: this.$gettext('PDF could not be loaded ....'),
        desc: error,
        type: 'error'
      })
    }
  }
}
</script>
