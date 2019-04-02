<template>
  <div class="oc-app-sidebar">
    <div class="sidebar-container">
      <div class="header primary">
        <div v-if="!disableAction" class="action">
          <slot name="action">
            <oc-button icon="close" class="uk-float-right uk-margin-small-right" @click="$emit('close', $event)"></oc-button>
          </slot>
        </div>
        <div class="sidebar-title">
          <slot name="title">
            <span>Heading</span>
          </slot>
        </div>
      </div>
      <div class="content">
        <slot name="content"></slot>
      </div>
      <div class="footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    icon: {
      default: 'folder',
      type: String
    },
    disableAction: {
      default: false,
      type: Boolean
    }
  }
}
</script>