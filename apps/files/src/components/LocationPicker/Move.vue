<template>
  <div>Hello world</div>
</template>

<script>
import { mapMutations } from 'vuex'
import MoveSidebarMainContent from './MoveSidebarMainContent.vue'

export default {
  name: 'LocationPickerMove',

  created() {
    this.SET_MAIN_CONTENT_COMPONENT(MoveSidebarMainContent)
  },

  methods: {
    ...mapMutations(['SET_MAIN_CONTENT_COMPONENT'])
  }
}
</script>
