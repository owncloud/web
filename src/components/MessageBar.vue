<template>
  <oc-notifications>
    <oc-notification-message
            v-for="(item, index) in activeMessages"
            :key="index"
            :title="item.title"
            :message="item.desc"
            :status="item.status"
            @close="deleteMessage(item)"
    />
  </oc-notifications>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['showMessage', 'deleteMessage'])
  },
  computed: {
    ...mapGetters(['activeMessages'])
  }
}
</script>
