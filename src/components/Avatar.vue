<template>
  <div v-if="enabled">
    <oc-spinner v-if="loading" />
    <oc-avatar width=42 height=42 v-if="!loading && avatarSource !== ''" :src="avatarSource" />
    <oc-icon size="large" v-if="!loading && avatarSource === ''" name="account_circle" color="white" class="uk-display-inline" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      /**
       * Set to object URL when loaded, or on failure, icon placeholder is shown
       */
      avatarSource: '',
      loading: true
    }
  },
  mounted: function () {
    if (!this.enabled) {
      return;
    }
    let headers = new Headers()
    let instance = this.$root.config.server || window.location.origin
    let url = instance + '/remote.php/dav/avatars/' + this.userid + '/128.png'
    headers.append('Authorization', 'Bearer ' + this.getToken)
    fetch(url, { headers })
      .then(response => {
        if (response.status === 404) {
          this.avatarSource = ''
          this.loading = false
        } else {
          return response.blob()
        }
      })
      .then(blobby => {
        this.loading = false
        this.avatarSource = window.URL.createObjectURL(blobby)
      })
  },
  computed: {
    ...mapGetters(['getToken']),
    enabled: function() {
      return this.$root.config.enableAvatars || true;
    }
  },
  props: {
    userid: {
      required: true,
      type: String
    }
  }
}
</script>
