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
      {{ resourceContentsText }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatFileSize } from '@ownclouders/web-pkg'
import { useResourceContents } from '../../composables'

export default defineComponent({
  props: {
    files: {
      type: Number,
      required: true
    },
    hiddenFiles: {
      type: Number,
      required: false,
      default: 0
    },
    folders: {
      type: Number,
      required: true
    },
    hiddenFolders: {
      type: Number,
      required: false,
      default: 0
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
    },
    showHiddenItems: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup: () => {
    const { resourceContentsText } = useResourceContents()

    return { resourceContentsText }
  },
  computed: {
    items() {
      return this.files + this.folders + (this.showSpaces ? this.spaces : 0)
    },
    text() {
      let filesStr = this.$ngettext('%{ filesCount } file', '%{ filesCount } files', this.files, {
        filesCount: this.files.toString()
      })

      if (this.showHiddenItems && this.hiddenFiles) {
        filesStr = this.$ngettext(
          '%{ filesCount } file including %{ filesHiddenCount } hidden',
          '%{ filesCount } files including %{ filesHiddenCount } hidden',
          this.files,
          {
            filesCount: this.files.toString(),
            filesHiddenCount: this.hiddenFiles.toString()
          }
        )
      }

      let foldersStr = this.$ngettext(
        '%{ foldersCount } folder',
        '%{ foldersCount } folders',
        this.folders,
        {
          foldersCount: this.folders.toString()
        }
      )

      if (this.showHiddenItems && this.hiddenFolders) {
        foldersStr = this.$ngettext(
          '%{ foldersCount } folder including %{ foldersHiddenCount } hidden',
          '%{ foldersCount } folders including %{ foldersHiddenCount } hidden',
          this.folders,
          {
            foldersCount: this.folders.toString(),
            foldersHiddenCount: this.hiddenFolders.toString()
          }
        )
      }

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
