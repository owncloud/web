<template>
  <div>
    <oc-spinner v-if="loading"></oc-spinner>
    <oc-avatar width=42 height=42 v-if="!loading && avatarSource !== ''" :src="avatarSource"></oc-avatar>
    <oc-icon size="large" v-if="!loading && avatarSource === ''" name="account_circle" color="white" class="uk-display-inline"></oc-icon>
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
    let headers = new Headers()
    let url = 'http://cloud.local/remote.php/dav/avatars/'+this.userid+'/128.png'
    headers.append('Authorization', 'Bearer ' + this.getToken)
    fetch(url, { headers })
    .then(response => {
      if(response.status === 404) {
        this.avatarSource = '';
        this.loading = false;
        return;
      } else {
        return response.blob()
      }
    })
    .then(blobby => {
      this.loading = false;
      this.avatarSource =  window.URL.createObjectURL(blobby)
    })
  
  },
  computed: {
    ...mapGetters(['getToken'])
  },
  props: {
    userid: {
      required: true,
      type: String
    }
  }
}
</script>