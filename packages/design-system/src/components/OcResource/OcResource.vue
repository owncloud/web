<template>
  <div class="oc-resource oc-text-overflow">
    <oc-resource-link
      v-if="isIconDisplayed"
      :resource="resource"
      :is-resource-clickable="isResourceClickable"
      :folder-link="folderLink"
      class="oc-resource-link"
      @click="emitClick"
    >
      <oc-img
        v-if="hasThumbnail"
        :key="thumbnail"
        v-oc-tooltip="tooltipLabelIcon"
        :src="thumbnail"
        class="oc-resource-thumbnail"
        width="40"
        height="40"
        :aria-label="tooltipLabelIcon"
      />
      <oc-resource-icon
        v-else
        v-oc-tooltip="tooltipLabelIcon"
        :aria-label="tooltipLabelIcon"
        :resource="resource"
      >
        <template v-if="showStatusIcon" #status>
          <oc-icon v-bind="statusIconAttrs" size="xsmall" />
        </template>
      </oc-resource-icon>
      <span v-if="showStatusIcon && hasThumbnail" class="oc-resource-thumbnail-status-badge">
        <oc-icon v-bind="statusIconAttrs" size="xsmall" />
      </span>
    </oc-resource-link>
    <div class="oc-resource-details oc-text-overflow" :class="{ 'oc-pl-s': isIconDisplayed }">
      <oc-resource-link
        v-slot="{ opensInNewWindowDescriptionId }"
        :resource="resource"
        :is-resource-clickable="isResourceClickable"
        :folder-link="folderLink"
        class="oc-text-overflow"
        @click="emitClick"
      >
        <span
          v-if="opensInNewWindowDescriptionId"
          :id="opensInNewWindowDescriptionId"
          class="oc-invisible-sr"
          v-text="$gettext('Opens in a new window')"
        />
        <oc-resource-name
          :key="resource.name"
          :name="resource.name"
          :extension="resource.extension"
          :type="resource.type"
          :full-path="resource.path"
          :is-path-displayed="isPathDisplayed"
          :is-extension-displayed="isExtensionDisplayed"
        />
      </oc-resource-link>
      <div class="oc-resource-indicators">
        <component
          :is="parentFolderComponentType"
          v-if="isPathDisplayed"
          :to="parentFolderLink"
          :style="parentFolderStyle"
          class="parent-folder"
          @click.stop="$emit('parentFolderClicked')"
        >
          <oc-icon v-bind="parentFolderLinkIconAttrs" />
          <span class="text" v-text="parentFolderName" />
        </component>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'

import OcButton from '../OcButton/OcButton.vue'
import OcImg from '../OcImage/OcImage.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcResourceName from '../OcResourceName/OcResourceName.vue'
import OcResourceIcon from '../OcResourceIcon/OcResourceIcon.vue'
import OcResourceLink from '../OcResourceLink/OcResourceLink.vue'
import { Resource } from 'web-client/src'

/**
 * Displays a resource together with the resource type icon or thumbnail
 */
export default defineComponent({
  name: 'OcResource',
  status: 'ready',
  release: '2.1.0',
  components: {
    OcButton,
    OcImg,
    OcIcon,
    OcResourceName,
    OcResourceIcon,
    OcResourceLink
  },
  props: {
    /**
     * The resource to be displayed
     */
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    /**
     * The resource folder link
     */
    folderLink: {
      type: Object,
      required: false,
      default: null
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
     * The resource parent folder name to be displayed
     */
    parentFolderName: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * The resource parent folder link path
     */
    parentFolderLink: {
      type: Object,
      required: false,
      default: null
    },
    /**
     * The resource parent folder link path icon additional attributes
     */
    parentFolderLinkIconAdditionalAttributes: {
      type: Object,
      required: false,
      default: () => {}
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
     * Asserts whether the resource thumbnail should be displayed
     */
    isThumbnailDisplayed: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Asserts whether the resource thumbnail should be displayed
     */
    isIconDisplayed: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Asserts whether clicking on the resource name triggers any action
     */
    isResourceClickable: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['click', 'parentFolderClicked'],
  computed: {
    parentFolderComponentType() {
      return this.parentFolderLink !== null ? 'router-link' : 'span'
    },

    parentFolderStyle() {
      const hasLinkTarget = this.parentFolderLink !== null
      return {
        cursor: hasLinkTarget ? 'pointer' : 'default'
      }
    },

    parentFolderLinkIconAttrs() {
      return {
        'fill-type': 'line',
        name: 'folder-2',
        size: 'small',
        ...this.parentFolderLinkIconAdditionalAttributes
      }
    },

    hasThumbnail() {
      return (
        this.isThumbnailDisplayed &&
        Object.prototype.hasOwnProperty.call(this.resource, 'thumbnail')
      )
    },

    thumbnail() {
      return this.resource.thumbnail
    },

    showStatusIcon() {
      return this.resource.locked || this.resource.processing
    },

    tooltipLabelIcon() {
      if (this.resource.locked) {
        return this.$gettext('This item is locked')
      }
      return null
    },

    statusIconAttrs() {
      if (this.resource.locked) {
        return {
          name: 'lock',
          fillType: 'fill'
        }
      }
      if (this.resource.processing) {
        return {
          name: 'loop-right',
          fillType: 'line'
        }
      }

      return {}
    }
  },

  methods: {
    emitClick() {
      /**
       * Triggered when the resource is a file and the name is clicked
       */
      this.$emit('click')
    }
  }
})
</script>

<style lang="scss">
.oc-resource {
  align-items: center;
  display: inline-flex;
  justify-content: flex-start;
  overflow: visible !important;

  &-link {
    position: relative;
  }

  &-thumbnail {
    border-radius: 2px;
    object-fit: cover;
    height: $oc-size-icon-default * 1.5;
    max-height: $oc-size-icon-default * 1.5;
    width: $oc-size-icon-default * 1.5;
    max-width: $oc-size-icon-default * 1.5;

    &-status-badge {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: var(--oc-space-small);
      height: var(--oc-space-small);
      padding: var(--oc-space-xsmall);
      line-height: var(--oc-space-small);
      border-radius: 30px;
      background: rgba(155, 155, 155, 0.8);
      color: white;
    }
  }

  &-details {
    display: block;

    a {
      text-decoration: none;
    }
    a:hover,
    a:focus {
      outline-offset: 0;
    }
  }

  &-indicators {
    display: flex;

    .parent-folder {
      display: flex;
      align-items: center;

      padding: 0 2px 0 2px;
      margin: 0 8px 0 -2px;

      .oc-icon {
        padding-right: 3px;
      }

      .text {
        font-size: 0.8125rem;
        color: var(--oc-color-text-muted);
        &:hover {
          color: var(--oc-color-text-default);
          text-decoration: underline;
        }
      }

      &:hover {
        background-color: var(--oc-color-input-bg);
        border-radius: 2px;
      }
    }
  }
}
</style>

<docs>
  ```js
    <template>
      <div>
        <oc-resource :resource="documents" parent-folder-link="parentFolderLink" class="oc-mb" />
        <oc-resource :resource="notes" is-path-displayed="true" class="oc-mb" />
        <oc-resource :resource="notes" is-resource-clickable="false" class="oc-mb" />
        <oc-resource :resource="notes" :is-extension-displayed="false" class="oc-mb" />
        <oc-resource :resource="forest" is-path-displayed="true" />
        <oc-resource :resource="something" is-path-displayed="true" parent-folder-name="Example parent folder"  />
      </div>
    </template>
    <script>
    export default {
      computed: {
        documents() {
          return {
            name: "Documents",
            path: "/Documents",
            indicators: [],
            type: "folder",
            isFolder: true
          }
        },
        notes() {
          return {
            name: "notes.txt",
            extension: "txt",
            path: "Documents/notes.txt",
            indicators: this.indicators,
            type: "file",
            isFolder: false
          }
        },
        forest() {
          return {
            name: "forest-image-with-filename-with-a-lot-of-characters.jpg",
            extension: "jpg",
            path: "images/nature/forest-image-with-filename-with-a-lot-of-characters.jpg",
            thumbnail: "https://picsum.photos/200/300",
            indicators: [],
            type: "file",
            isFolder: false,
            opensInNewWindow: true,
          }
        },
        something() {
          return {
            name: "another-image.jpg",
            extension: "jpg",
            path: "another-image.jpg",
            thumbnail: "https://picsum.photos/200/300",
            indicators: [],
            type: "file",
            isFolder: false,
            opensInNewWindow: true,
          }
        },
        indicators() {
          return [
            {
              id: 'files-sharing',
              label: "Shared with other people",
              visible: true,
              icon: 'group',
              handler: (resource, indicatorId) => alert(`Resource: ${resource.name}, indicator: ${indicatorId}`)
            },
            {
              id: 'file-link',
              label: "Shared via link",
              visible: true,
              icon: 'link',
            }
          ]
        },
        parentFolderLink() {
          return {
            name: "home",
            params: {
              action: "copy",
              item: 'Documents',
            },
            query: {
              resource: "notes"
            }
          }
        }
      },
    }
  </script>
  ```
</docs>
