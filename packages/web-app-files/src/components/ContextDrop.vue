<template>
  <div class="context-drop">
    <slot name="drop-content" />
  </div>
</template>

<script>
export default {
  name: 'ContextDrop'
}
</script>

<style lang="scss">
// note: needed so that the box shadow from `oc-box-shadow-medium` doesn't get suppressed
.context-drop {
  li {
    padding-left: 0 !important;
    padding-right: 0 !important;
    a,
    button:not([role='switch']) {
      box-sizing: border-box !important;
      padding: 6px !important;
      &:focus,
      &:hover {
        background-color: var(--oc-color-background-hover) !important;

        text-decoration: none !important;
        border-radius: 5px !important;
      }
      &:hover span {
        color: var(--oc-color-swatch-brand-hover) !important;
      }
      span {
        text-decoration: none !important;
      }
    }
  }
}
</style>
