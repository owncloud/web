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
      /**
       * Shows spinner in place whilst loading avatar from server
       */
      loading: true
    }
  },
  methods: {
    /**
     * Load a new avatar from this userid
     */
    setUser (userid) {
      this.loading = true
      this.avatarSource = ''
      if (!this.enabled || userid === '') {
        this.loading = false
        return
      }
      let headers = new Headers()
      let instance = this.$root.config.server || window.location.origin
      let url = instance + '/remote.php/dav/avatars/' + this.userid + '/128.png'
      headers.append('Authorization', 'Bearer ' + this.getToken)
      fetch(url, { headers })
        .then(response => {
          if (response.ok) {
            return response.blob()
          }
          throw new Error('Network response was not ok.')
        })
        .then(blob => {
          this.loading = false
          this.avatarSource = window.URL.createObjectURL(blob)
        })
        .catch(error => {
          this.avatarSource = ''
          this.loading = false
          console.log('There has been a problem with your fetch operation: ', error.message)
        })
    }
  },
  watch: {
    userid: function (userid, old) {
      this.setUser(userid)
    }
  },
  mounted: function () {
    // Handled mounted situation. Userid might not be set yet so try placeholder
    if (this.userid !== '') {
      this.setUser(this.userid)
    } else {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters(['getToken']),
    enabled: function () {
      return this.$root.config.enableAvatars || true
    }
  },
  props: {
    userid: {
      /**
       * Allow empty string to show placeholder
       */
      default: ''
    }
  }
}
</script>
