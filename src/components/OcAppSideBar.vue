<template>
  <div class="oc-app-sidebar">
    <div class="sidebar-container">
      <div class="header primary">
        <div class="icon">
          <slot name="icon">
            <v-icon color="white" large>{{ icon }}</v-icon>
          </slot>
        </div>
        <div class="title">
          <slot name="title">
            <span>Heading</span>
          </slot>
        </div>
        <div v-if="!disableAction" class="action">
          <slot name="action">
            <button @click="$emit('close', $event)"><v-icon color="white" large>close</v-icon></button>
          </slot>
        </div>
        <div class="headerContent">
          <slot name="headerContent"></slot>
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
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: "iconArea title headerAction" "headerContent headerContent headerContent";
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

.title {
  grid-area: title;
  text-align: center;
  color:white;
}
.title span,p {
  font-size: .6em;
  line-height: 60px;
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
