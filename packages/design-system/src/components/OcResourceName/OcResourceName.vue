<template>
  <span
    v-oc-tooltip="tooltip"
    v-oc-browser-translate-off
    class="oc-resource-name"
    :class="[{ 'oc-display-inline-block': !truncateName }]"
    :data-test-resource-path="fullPath"
    :data-test-resource-name="fullName"
    :data-test-resource-type="type"
    :title="htmlTitle"
  >
    <span v-if="truncateName" class="oc-text-truncate">
      <span class="oc-resource-basename" v-text="displayName" />
    </span>
    <span v-else class="oc-resource-basename oc-text-break" v-text="displayName" /><span
      v-if="extension && isExtensionDisplayed"
      class="oc-resource-extension"
      v-text="displayExtension"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import path from 'path'

export default defineComponent({
  name: 'OcResourceName',
  status: 'ready',
  release: '2.1.0',
  props: {
    /**
     * The name of the resource
     */
    name: {
      type: String,
      required: true
    },
    /**
     * The prefix that will be shown in the path
     */
    pathPrefix: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * The extension of the resource, if there is one
     */
    extension: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * The type of the resource
     */
    type: {
      type: String,
      required: true
    },
    /**
     * A full path of the resource
     */
    fullPath: {
      type: String,
      required: true
    },
    /**
     * Asserts whether the resource path should be displayed
     */
    isPathDisplayed: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether the resource extension should be displayed
     */
    isExtensionDisplayed: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Asserts whether the resource name should be truncated if it's too long
     */
    truncateName: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  computed: {
    tooltip() {
      return this.pathTooltip
    },

    fullName() {
      return (this.displayPath || '') + this.name
    },

    displayName() {
      if (this.extension) {
        return this.name.slice(0, -this.extension.length - 1)
      }
      return this.name
    },

    displayExtension() {
      return this.extension ? '.' + this.extension : ''
    },

    displayPath() {
      if (!this.isPathDisplayed) {
        return null
      }
      const pathSplit = this.fullPath.replace(/^\//, '').split('/')
      if (pathSplit.length < 2) {
        return null
      }
      if (pathSplit.length === 2) {
        return pathSplit[0] + '/'
      }
      return `…/${pathSplit[pathSplit.length - 2]}/`
    },

    pathTooltip() {
      if (!this.isPathDisplayed) {
        return null
      }
      if (this.displayPath === this.fullPath) {
        return null
      }
      if (this.pathPrefix) {
        return path.join(this.pathPrefix, this.fullPath)
      }
      return this.fullPath
    },

    htmlTitle() {
      if (this.tooltip) {
        return
      }

      if (this.isExtensionDisplayed) {
        return `${this.displayName}${this.displayExtension}`
      }

      return this.displayName
    }
  }
})
</script>

<style lang="scss">
.oc-resource {
  &-name {
    display: flex;
    min-width: 0;

    &:hover {
      text-decoration: underline;
      text-decoration-color: var(--oc-color-text-default);
    }
  }

  &-basename,
  &-extension {
    color: var(--oc-color-text-default);
    white-space: pre;
  }

  &-path {
    color: var(--oc-color-text-muted);
    white-space: pre;
  }
}
</style>

<docs>
```js
<oc-resource-name full-path="documents/notes.txt" name="notes.txt" extension="txt" type="file"
                  :is-extension-displayed="false"/>
<oc-resource-name full-path="documents/notes.txt" name="notes.txt" extension="txt" type="file"/>
<oc-resource-name full-path="documents/notes.txt"
                  name="super-long-file-name-which-will-be-truncated-when-exceeding-the-screen-space-while-still-preserving-the-file-extension-at-the-end.txt"
                  extension="txt" type="file"/>
<oc-resource-name full-path="documents/notes.txt"
                  name="super-long-file-name-which-will-not-be-truncated-when-you-disable-it-manually-via-the-truncate-property.txt"
                  extension="txt" type="file" :truncate-name="false"/>
<oc-resource-name full-path="images/nature/forest.jpg" :is-path-displayed="true" name="forest.jpg" extension="jpg"
                  type="file"/>
<oc-resource-name
    full-path="super-long-path-to-a-subfolder-which-is-a-lot-of-levels-away-from–the-root-super-long-path-to-a-subfolder-which-is-a-lot-of-levels-away-from–the-root/asdf.txt"
    :is-path-displayed="true" name="asdf.txt" extension="txt" type="file"/>
<oc-resource-name full-path="some-folder" name="regular-folder" extension="" type="folder"/>
<oc-resource-name full-path="folder-name-with.dot" name="folder-name-with.dot" extension="" type="folder"/>
```
</docs>
