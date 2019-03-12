<template>
  <div class="oc-app-sidebar">
    <div class="sidebar-container">
      <div class="header primary">
        <div class="sidebar-title">
          <slot name="title">
            <span>Heading</span>
          </slot>
        </div>
        <div v-if="!disableAction" class="action">
          <slot name="action">
            <button @click="$emit('close', $event)"><v-icon color="white" large>close</v-icon></button>
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
<style scoped>
.sidebar-container {
  max-height: calc(100vh - 115px);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 0.5fr 5fr 0.5fr;
  grid-template-areas: "header" "body" "footer";
}

.header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "title headerAction" "headerContent headerContent";
  grid-area: header;
}

.headerContent {
  grid-area: headerContent;
}

.action {
  grid-area: headerAction;
  padding: 1em;
}

.action button {
  float: right;
}

.action button:hover {
  border-radius: 46%;
  background-color: rgba(200, 200, 200, .5);
}

.icon {
  grid-area: iconArea;
  padding: 1em;
}

.sidebar-title {
  grid-area: title;
  padding-left: 24px;
  color:white;
}
.sidebar-title span,p {
  display: flex;
  align-items: center;
  line-height: 60px;
  font-weight: bold;
  font-size: 16px;
}
.content { grid-area: body; }

.footer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: ". . .";
  grid-area: footer;
}
</style>
