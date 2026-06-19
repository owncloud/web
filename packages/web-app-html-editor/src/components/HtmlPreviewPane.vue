<template>
  <!-- Sandboxed preview. `srcdoc` runs at an opaque origin (no allow-same-origin),
       so it cannot read the shell's cookies or storage. See DECISIONS.md D3. -->
  <iframe
    class="html-preview-pane"
    :srcdoc="content"
    sandbox="allow-scripts allow-forms allow-popups"
    referrerpolicy="no-referrer"
    :title="$gettext('HTML preview')"
  />
</template>

<script lang="ts" setup>
interface Props {
  content: string
}
defineProps<Props>()
</script>

<style scoped>
.html-preview-pane {
  width: 100%;
  height: 100%;
  border: none;
  background-color: var(--oc-color-background-default);
}
</style>
