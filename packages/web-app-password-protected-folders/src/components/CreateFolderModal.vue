<template>
  <form autocomplete="off" @submit.prevent="emit('confirm')">
    <oc-text-input
      id="input-folder-name"
      v-model="formData.folderName"
      :label="$gettext('Folder name')"
    />
    <oc-text-input
      id="input-folder-password"
      v-model="formData.password"
      type="password"
      :label="$gettext('Password')"
      class="oc-mt-s"
    />
    <input type="submit" class="oc-hidden" />
  </form>
</template>

<script lang="ts" setup>
import { useMessages, useResourcesStore, useSpacesStore } from '@ownclouders/web-pkg'
import { computed, reactive, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useCreateFileHandler } from '../composables/useCreateFileHandler'

const emit = defineEmits<{
  confirm: []
  'update:confirmDisabled': [isDisabled: boolean]
}>()

const { $gettext } = useGettext()
const { showErrorMessage } = useMessages()
const { createFileHandler } = useCreateFileHandler()
const { currentFolder } = useResourcesStore()
const { currentSpace } = useSpacesStore()

const formData = reactive({
  folderName: '',
  password: ''
})

const isFormValid = computed(() => formData.folderName !== '' && formData.password !== '')

const onConfirm = async () => {
  if (!unref(isFormValid)) {
    return Promise.reject()
  }

  try {
    await createFileHandler({
      fileName: formData.folderName,
      currentFolder: unref(currentFolder),
      space: unref(currentSpace),
      password: formData.password
    })
  } catch (error) {
    console.error(error)
    showErrorMessage({ title: $gettext('Failed to create folder'), errors: [error] })
  }
}

watch(
  isFormValid,
  (isValid) => {
    emit('update:confirmDisabled', !isValid)
  },
  { immediate: true }
)

defineExpose({ onConfirm })
</script>
