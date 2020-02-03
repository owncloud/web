<template>
  <oc-notifications>
    <transition-group name="oc-alerts-transition" tag="div">
      <oc-notification-message
            v-for="item in $_ocMessages_limited"
            :key="item.id"
            :title="item.title"
            :message="item.desc"
            :status="item.status"
            @close="deleteMessage(item)"
            class="uk-width-large"
    />
    </transition-group>
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
    $_ocMessages_limited () {
      return this.activeMessages ? this.activeMessages.slice(0, 5) : []
    }
  },
  methods: {
    deleteMessage (item) {
      this.$emit('deleteMessage', item)
    }
  }
}
</script>
