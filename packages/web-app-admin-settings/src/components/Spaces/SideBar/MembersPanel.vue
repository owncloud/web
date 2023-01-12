<template>
  <div class="oc-ml-s">
		<div v-if="spaceResource.spaceRoles.manager.length" class="oc-mb-m">
			<h4>Manager</h4>
			<div v-for="(manager, index) in spaceResource.spaceRoles.manager.sort((a, b) => a.displayName.localeCompare(b.displayName))" class="oc-flex oc-flex-middle oc-mb-s" :key="index">
				<oc-avatar
            :user-name="manager.displayName"
            :width="36"
            class="oc-mr-s"
          />
				{{ manager.displayName }}
			</div>
		</div>
		<div v-if="spaceResource.spaceRoles.editor.length" class="oc-mb-m">
			<h4>Editor</h4>
			<div v-for="(editor, index) in spaceResource.spaceRoles.editor.sort((a, b) => a.displayName.localeCompare(b.displayName))" class="oc-flex oc-flex-middle oc-mb-s" :key="index">
				<oc-avatar
						v-if="editor.kind === 'user'"
            :user-name="editor.displayName"
            :width="36"
            class="oc-mr-s"
          />
					<oc-avatar-item
						:width="36"
            icon-size="medium"
            :icon="groupIcon"
            :name="group"
						class="oc-mr-s"
						v-else />
				{{ editor.displayName }}
			</div>
		</div>
		<div v-if="spaceResource.spaceRoles.viewer.length" class="oc-mb-m">
			<h4>Viewer</h4>
			<div v-for="(viewer, index) in spaceResource.spaceRoles.viewer.sort((a, b) => a.displayName.localeCompare(b.displayName))" class="oc-flex oc-flex-middle oc-mb-s" :key="index">
				<oc-avatar
						v-if="viewer.kind === 'user'"
            :user-name="viewer.displayName"
            :width="36"
            class="oc-mr-s"
          />
					<oc-avatar-item
						:width="36"
            icon-size="medium"
            :icon="groupIcon"
            :name="group"
						class="oc-mr-s"
						v-else />
				{{ viewer.displayName }}
			</div>
		</div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src'
import { ShareTypes } from 'web-client/src/helpers/share'

export default defineComponent({
  name: 'MembersPanel',
  props: {
    spaceResource: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props) {
		const groupIcon = computed(() => {
			return ShareTypes.group.icon
		})
		console.log(props.spaceResource)
		return {
			groupIcon
		}
  }
})
</script>
<style lang="scss">

</style>
