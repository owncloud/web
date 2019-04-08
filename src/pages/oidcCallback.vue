<template>
    <p>Redirecting</p>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'OidcCallbackPage',
  mounted () {
    this.$nextTick(() => {
      this.callback()
    })
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['configuration'])
  },
  methods: {
    ...mapActions(['callback'])
  }
}
</script>
