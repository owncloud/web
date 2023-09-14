<template>
  <div class="oc-text-nowrap oc-text-center">
    <p
      data-testid="files-list-footer-info"
      :data-test-items="items"
      :data-test-files="files"
      :data-test-folders="folders"
      :data-test-spaces="spaces"
      :data-test-size="size"
      class="oc-text-muted"
    >
      {{ text }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatFileSize } from 'web-pkg/src/helpers'

export default defineComponent({
  props: {
    files: {
      type: Number,
      required: true
    },
    folders: {
      type: Number,
      required: true
    },
    spaces: {
      type: Number,
      default: 0,
      required: false
    },
    showSpaces: {
      type: Boolean,
      default: false,
      required: false
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
      return this.files + this.folders + (this.showSpaces ? this.spaces : 0)
    },
    text() {
      const filesStr = this.$ngettext('%{ filesCount } file', '%{ filesCount } files', this.files, {
        filesCount: this.files.toString()
      })

      const foldersStr = this.$ngettext(
        '%{ foldersCount } folder',
        '%{ foldersCount } folders',
        this.folders,
        {
          foldersCount: this.folders.toString()
        }
      )
      const spacesStr = this.$ngettext(
        '%{ spacesCount } space',
        '%{ spacesCount } spaces',
        this.spaces,
        {
          spacesCount: this.spaces.toString()
        }
      )

      const itemSize = formatFileSize(this.size, this.$language.current)
      const size = parseFloat(this.size?.toString())
      if (this.showSpaces) {
        return size > 0
          ? this.$ngettext(
              '%{ itemsCount } item with %{ itemSize } in total (%{ filesStr}, %{foldersStr}, %{spacesStr})',
              '%{ itemsCount } items with %{ itemSize } in total (%{ filesStr}, %{foldersStr}, %{spacesStr})',
              this.items,
              {
                itemsCount: this.items.toString(),
                itemSize,
                filesStr,
                foldersStr,
                spacesStr
              }
            )
          : this.$ngettext(
              '%{ itemsCount } item in total (%{ filesStr}, %{foldersStr}, %{spacesStr})',
              '%{ itemsCount } items in total (%{ filesStr}, %{foldersStr}, %{spacesStr})',
              this.items,
              {
                itemsCount: this.items.toString(),
                itemSize,
                filesStr,
                foldersStr,
                spacesStr
              }
            )
      } else {
        return size > 0
          ? this.$ngettext(
              '%{ itemsCount } item with %{ itemSize } in total (%{ filesStr}, %{foldersStr})',
              '%{ itemsCount } items with %{ itemSize } in total (%{ filesStr}, %{foldersStr})',
              this.items,
              {
                itemsCount: this.items.toString(),
                itemSize,
                filesStr,
                foldersStr,
                spacesStr
              }
            )
          : this.$ngettext(
              '%{ itemsCount } item in total (%{ filesStr}, %{foldersStr})',
              '%{ itemsCount } items in total (%{ filesStr}, %{foldersStr})',
              this.items,
              {
                itemsCount: this.items.toString(),
                itemSize,
                filesStr,
                foldersStr,
                spacesStr
              }
            )
      }
    }
  }
})
</script>
