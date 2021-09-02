<template>
  <main>
    <div>
      <list-loader v-if="loading" />
      <no-content-message
        v-if="!loading && !app_url"
        id="no-app-data"
        class="files-empty"
        icon="warning"
      >
        <template #message>
          <span v-translate> Application error </span>
        </template>
      </no-content-message>
      <iframe v-if="app_url && method === 'GET'" class="app-iframe" :src="app_url" />
      <div v-if="app_url && method === 'POST' && form_parameters">
        <form :action="app_url" target="app-iframe" method="post">
          <input ref="subm" type="submit" :value="form_parameters" class="hide" />
          <div v-for="(item, key, index) in form_parameters" :key="index">
            <input :name="key" :value="item" type="hidden" />
          </div>
        </form>
        <iframe class="app-iframe" name="app-iframe" />
      </div>
    </div>
  </main>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
export default {
  name: 'ExternalApps',
  components: {
    ListLoader,
    NoContentMessage
  },
  data: () => ({
    loading: true,
    app: '',
    file_id: '',
    app_url: '',
    method: '',
    form_parameters: {}
  }),
  computed: {
    ...mapGetters(['getToken'])
  },
  updated() {
    if (this.method === 'POST' && this.form_parameters) {
      console.log('initiate click', this.$refs.subm.click())
      this.$refs.subm.click()
    }
  },
  mounted() {
    document.title = this.$route.params.app
  },
  created() {
    console.log('route', this.$route.params)
    // this.test = this.$router.params.userId
    this.app = this.$route.params.app
    this.file_id = this.$route.params.file_id
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + this.getToken)
    headers.append('X-Requested-With', 'XMLHttpRequest')
    const url = '/app/open?file_id=' + this.file_id + '&app_name=' + this.app
    fetch(url, {
      method: 'POST',
      headers
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.app_url) this.app_url = data.app_url
        if (data && data.method) this.method = data.method
        if (data && data.form_parameters) this.form_parameters = data.form_parameters
        if (this.app_url && this.method) this.loading = false
        console.log('post data', data)
      })
      .catch(err => {
        this.loading = false
        console.log(err)
      })
  },
  methods: {
    ...mapActions(['showMessage'])
  }
}
</script>
<style scoped>
.hide {
  display: none;
}
#frameholder,
.app-iframe {
  width: 100vw;
  height: 98vh;
}
</style>
