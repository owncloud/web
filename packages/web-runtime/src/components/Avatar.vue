<template>
  <component :is="type" :aria-hidden="true">
    <oc-spinner
      v-if="loading"
      key="avatar-loading"
      :style="`width: ${width}px; height: ${width}px;`"
    />
    <oc-avatar
      v-else
      key="avatar-loaded"
      :width="width"
      :src="avatarSource"
      :user-name="userName"
    />
  </component>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { mapGetters } from 'vuex'
import { useCapabilityStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'Avatar',
  props: {
    /**
     * The html element used for the avatar container.
     * `div, span`
     */
    type: {
      type: String,
      default: 'div',
      validator: (value: string) => {
        return ['div', 'span'].includes(value)
      }
    },
    userName: {
      type: String,
      default: ''
    },
    userid: {
      /**
       * Allow empty string to show placeholder
       */
      type: String,
      default: ''
    },
    width: {
      type: Number,
      required: false,
      default: 42
    }
  },
  setup() {
    const capabilityStore = useCapabilityStore()
    const capabilityRefs = storeToRefs(capabilityStore)

    return {
      userProfilePicture: capabilityRefs.sharingUserProfilePicture
    }
  },
  data() {
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
  computed: {
    ...mapGetters(['configuration'])
  },
  watch: {
    userid: function (userid) {
      this.setUser(userid)
    }
  },
  mounted: function () {
    if (this.userid !== '') {
      this.setUser(this.userid)
    } else {
      this.loading = false
    }
  },
  methods: {
    /**
     * Load a new avatar from this userid
     */
    setUser(userid) {
      this.loading = true
      this.avatarSource = ''
      if (!this.userProfilePicture || userid === '') {
        this.loading = false
        return
      }
      const instance = this.configuration.server || window.location.origin
      const url = instance + 'remote.php/dav/avatars/' + userid + '/128.png'
      this.$clientService.httpAuthenticated
        .get<Blob>(url, { responseType: 'blob' })
        .then((response) => {
          if (response.status === 200) {
            return response.data
          }
          if (response.status !== 404) {
            throw new Error(`Unexpected status code ${response.status}`)
          }
        })
        .then((blob) => {
          this.loading = false
          if (blob) {
            this.avatarSource = window.URL.createObjectURL(blob)
          } else {
            // 404, none found
            this.avatarSource = ''
          }
        })
        .catch((error) => {
          this.avatarSource = ''
          this.loading = false
          console.error(`Error loading avatar image for user "${userid}": `, error.message)
        })
    }
  }
})
</script>
