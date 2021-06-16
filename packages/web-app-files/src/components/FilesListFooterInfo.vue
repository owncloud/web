<template functional>
  <div
    :ref="data.ref"
    v-bind="data.attrs"
    class="uk-text-nowrap oc-text-muted uk-text-center"
    :class="[data.staticClass, data.class]"
  >
    <!--
      TODO: merge all strings here to one interpollated translation
      This requires to come up with a way in tests to still select only folders and files lengths
    -->
    <translate>Showing</translate>
    <span id="files-list-count-folders" v-text="props.folders" />
    <translate :translate-n="props.folders" translate-plural="folders">folder</translate>
    <translate>and</translate>
    <translate
      id="files-list-count-files"
      :translate-n="props.files"
      translate-plural="%{count} files"
      :translate-params="{ count: props.files }"
      >%{count} file</translate
    >
    <translate
      :translate-n="props.total"
      translate-plural="of %{count} resources"
      :translate-params="{ count: props.total }"
      >of %{count} resource</translate
    >
    <span v-if="props.size">&ndash; {{ props.size }}</span>
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
    total: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      required: false,
      default: null
    }
  }
}
</script>
