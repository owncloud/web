<template>
  <portal to="app.runtime.modal">
    <oc-modal
      :title="modalTitle"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Confirm')"
      :button-confirm-disabled="confirmButtonDisabled"
      @confirm="editQuota"
      @cancel="cancel"
    >
      <template #content>
        <quota-select
          :title="$gettext('Space quota')"
          :total-quota="selectedOption"
          @selected-option-change="changeSelectedQuotaOption"
        />
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, unref } from 'vue'
import { mapActions, mapMutations } from 'vuex'
import { useGraphClient } from 'web-pkg/src/composables'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'

export default defineComponent({
  name: 'SpaceQuotaModal',
  components: {
    QuotaSelect
  },
  props: {
    spaces: {
      type: Array,
      required: true
    },
    cancel: {
      type: Function,
      required: true
    }
  },
  emits: ['spaceQuotaUpdated'],
  setup() {
    return {
      ...useGraphClient()
    }
  },
  data: function () {
    return {
      selectedOption: 0
    }
  },
  computed: {
    confirmButtonDisabled() {
      return !this.spaces.some((space) => space.spaceQuota.total !== this.selectedOption)
    },
    modalTitle() {
      if (this.spaces.length === 1) {
        return this.$gettext('Change quota for space %{name}', {
          name: this.spaces[0].name
        })
      }
      return this.$gettext('Change quota for %{count} spaces', {
        count: this.spaces.length
      })
    }
  },
  mounted() {
    console.log('==!!==')
    console.log(this.spaces)
    this.selectedOption = this.spaces[0].spaceQuota.total || 0
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    changeSelectedQuotaOption(option) {
      this.selectedOption = option.value
    },
    editQuota() {
      const requests = []
      this.spaces.forEach((space) => {
        const request = this.graphClient.drives
          .updateDrive(space.id, { quota: { total: this.selectedOption } }, {})
          .then(({ data }) => {
            this.cancel()
            if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
              this.$emit('spaceQuotaUpdated', data.quota)
            }
            this.UPDATE_SPACE_FIELD({
              id: space.id,
              field: 'spaceQuota',
              value: data.quota
            })
            this.UPDATE_RESOURCE_FIELD({
              id: space.id,
              field: 'spaceQuota',
              value: data.quota
            })
            this.showMessage({
              title: this.$gettext('Space quota was changed successfully')
            })
          })
          .catch((error) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to change space quota'),
              status: 'danger'
            })
          })
        requests.push(request)
      })
      return Promise.all(requests)
    }
  }
})
</script>
