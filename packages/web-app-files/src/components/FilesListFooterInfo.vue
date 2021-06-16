<template functional>
  <div
    :ref="data.ref"
    v-bind="data.attrs"
    class="uk-text-nowrap oc-text-muted uk-text-center"
    :class="[data.staticClass, data.class]"
  >
    <translate
      :translate-n="props.files"
      :translate-params="{ filesCount: props.files }"
      translate-plural="%{filesCount} files"
      data-test-id="files-list-files-count"
      :data-test-files="props.files"
      >%{filesCount} file</translate
    >
    <span>,</span>
    <translate
      :translate-n="props.folders"
      :translate-params="{ folderCount: props.folders }"
      translate-plural="%{folderCount} folders"
      data-test-id="files-list-folder-count"
      :data-test-files="props.folders"
      >%{folderCount} folder</translate
    >
    <template v-if="props.size > 0">
      <span>&ndash;</span>
      <oc-resource-size
        data-test-it="files-list-item-size"
        :data-test-size="props.size"
        :size="props.size"
      />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    files: {
      type: Number,
      required: true
    },
    folders: {
      type: Number,
      required: true
    },
    /**
     * Total size in bytes. Unformatted strings and integers are allowed.
     */
    size: {
      type: [String, Number],
      required: false,
      default: null
    }
  }
}
</script>
