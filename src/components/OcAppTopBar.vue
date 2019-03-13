<template>
  <div class="grid-container">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="title">
      <slot name="title"></slot>
    </div>
    <div class="actions">
      <div class="actionSlot" :key="index" v-for="(slot, index) in actionSlots">
        <slot :name="slot" ></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    actionSlots () {
      let filteredSlots = Object.keys(this.$slots).filter((s) => {
        return s.startsWith('action_')
      })
      return filteredSlots.reverse()
    }
  }
}
</script>