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

    <div class="oc-flex oc-flex-middle oc-mt-m">
      <oc-icon class="oc-mr-s" :name="selectedTypeIcon" fill-type="line" />
      <link-role-dropdown
        id="input-folder-permissions"
        v-model="formData.selectedType"
        :available-link-type-options="availableLinkTypes"
      />
    </div>

    <input type="submit" class="oc-hidden" />
  </form>
</template>

<script lang="ts" setup>
import {
  LinkRoleDropdown,
  useLinkTypes,
  useMessages,
  useResourcesStore,
  useSpacesStore
} from '@ownclouders/web-pkg'
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
const { defaultLinkType, getAvailableLinkTypes, getLinkRoleByType } = useLinkTypes()

const formData = reactive({
  folderName: '',
  password: '',
  selectedType: unref(defaultLinkType)
})

const isFormValid = computed(() => formData.folderName !== '' && formData.password !== '')
const availableLinkTypes = computed(() => getAvailableLinkTypes({ isFolder: true }))
const selectedTypeIcon = computed(() => getLinkRoleByType(formData.selectedType).icon)

const onConfirm = async () => {
  if (!unref(isFormValid)) {
    return Promise.reject()
  }

  try {
    await createFileHandler({
      fileName: formData.folderName,
      currentFolder: unref(currentFolder),
      space: unref(currentSpace),
      password: formData.password,
      type: formData.selectedType
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
