<template>
  <oc-notifications :position="notificationPosition">
    <oc-notification-message
      v-for="item in $_ocMessages_limited"
      :key="item.id"
      :title="item.title"
      :message="item.desc"
      :status="item.status"
      :timeout="item.timeout"
      :style="item.style"
      @close="deleteMessage(item)"
    />
  </oc-notifications>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'

export default defineComponent({
  props: {
    activeMessages: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  emits: ['deleteMessage'],
  computed: {
    ...mapGetters(['configuration']),
    notificationPosition() {
      if (this.configuration.options.topCenterNotifications) {
        return 'top-center'
      }
      return 'default'
    },
    $_ocMessages_limited() {
      return this.activeMessages ? this.activeMessages.slice(0, 5) : []
    }
  },
  methods: {
    deleteMessage(item) {
      this.$emit('deleteMessage', item)
    }
  }
})
</script>
