<template>
  <div>
    <iframe id="compat-settings" ref="settingsFrame" :src="iframeSource"></iframe>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['configuration']),
    iframeSource () {
      return this.configuration.server + 'index.php/settings?noheader=true'
    }
  }
}
</script>
<style scoped>
#compat-settings {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

</style>
