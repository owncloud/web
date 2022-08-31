<template>
  <div class="oc-text-nowrap oc-text-center">
    <p
      data-testid="files-list-footer-info"
      :data-test-items="items"
      :data-test-files="files"
      :data-test-folders="folders"
      :data-test-size="size"
      class="oc-color-text-default"
    >
      {{ text }}
    </p>
  </div>
</template>

<script>
import { formatFileSize } from 'web-pkg/src/helpers'

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
  },
  computed: {
    items() {
      return this.files + this.folders
    },
    text() {
      const filesStr = this.$gettextInterpolate(
        this.$ngettext('%{ filesCount } file', '%{ filesCount } files', this.files),
        {
          filesCount: this.files
        }
      )
      const foldersStr = this.$gettextInterpolate(
        this.$ngettext('%{ foldersCount } folder', '%{ foldersCount } folders', this.folders),
        {
          foldersCount: this.folders
        }
      )
      const itemSize = formatFileSize(this.size, this.$language.current)
      const translated =
        this.size > 0
          ? this.$ngettext(
              '%{ itemsCount } item with %{ itemSize } in total (%{ filesStr}, %{foldersStr})',
              '%{ itemsCount } items with %{ itemSize } in total (%{ filesStr}, %{foldersStr})',
              this.items
            )
          : this.$ngettext(
              '%{ itemsCount } item in total (%{ filesStr}, %{foldersStr})',
              '%{ itemsCount } items in total (%{ filesStr}, %{foldersStr})',
              this.items
            )
      return this.$gettextInterpolate(translated, {
        itemsCount: this.items,
        itemSize,
        filesStr,
        foldersStr
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.oc-text-nowrap p {
  opacity: 0.6;
}
</style>
