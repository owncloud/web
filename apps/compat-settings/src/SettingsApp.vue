<template>
  <div>
    <iframe id="compat-settings" ref="settingsFrame" :src="iframeSource"></iframe>
  </div>
</template>
<script>
import queryString from 'query-string'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      sectionId: this.$route.query.sectionid || 'personal/general'
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    iframeSource () {
      const sectionParts = this.sectionId && this.sectionId.split('/')
      let sectionBase = 'personal'
      let sectionSub = 'general'
      if (sectionParts && sectionParts.length === 2) {
        if (sectionParts[0] === 'admin') {
          sectionBase = 'admin'
        }
        sectionSub = sectionParts[1]
      }
      const query = queryString.stringify({
        cacheBuster: new Date().getTime() + Math.floor(Math.random() * 1000),
        phoenix: true,
        sectionid: sectionSub
      })
      return this.configuration.server + 'index.php/settings/' + sectionBase + '?' + query
    }
  },
  watch: {
    $route (to, from) {
      if (to.name === 'compat-settings') {
        this.sectionId = to.query.sectionid
      }
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
