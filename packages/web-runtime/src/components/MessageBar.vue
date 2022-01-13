<template>
  <oc-notifications>
    <oc-notification-message
      v-for="item in $_ocMessages_limited"
      :key="item.id"
      :title="$gettext(item.title)"
      :message="$gettext(item.desc)"
      :status="item.status"
      class="oc-width-large"
      @close="deleteMessage(item)"
    />
  </oc-notifications>
</template>

<script>
export default {
  props: {
    activeMessages: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    $_ocMessages_limited() {
      return this.activeMessages ? this.activeMessages.slice(0, 5) : []
    }
  },
  methods: {
    deleteMessage(item) {
      this.$emit('deleteMessage', item)
    }
  }
}
</script>
