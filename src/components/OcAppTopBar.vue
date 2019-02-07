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
<style scoped>
.grid-container {
  background: #e3e3e3;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "info title actions";
}

.actionSlot {
  float:right;
}

.Info { grid-area: info; }

.title { grid-area: title; }

.actions {
  float: right;
  margin-right: .5em;
  grid-area: actions; }
</style>
