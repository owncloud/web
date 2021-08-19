<template>
  <div id="oc-no-selection">
    <div class="files-preview oc-mb">
      <div class="files-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="select_items" />
        <span class="preview-text" data-testid="selectedFilesText" v-text="selectedFilesString" />
      </div>
    </div>
  </div>
</template>
<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'
import MixinRoutes from '../../mixins/routes'

export default {
  name: 'NoSelection',
  mixins: [Mixins, MixinResources, MixinRoutes],
  title: $gettext => {
    return $gettext('Details')
  },
  computed: {
    selectedFilesString() {
      return this.$gettext('Select a file or folder to view details.')
    }
  }
}
</script>
<style lang="scss" scoped>
.files-preview {
  position: relative;
  border: 10px solid transparent;
  height: 230px;
  text-align: center;
  color: var(--oc-color-swatch-passive-muted);

  &-body {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);

    .preview-icon {
      display: inline-block;
    }
    .preview-text {
      display: block;
    }
  }
}
</style>
