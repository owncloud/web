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
          @selectedOptionChange="changeSelectedQuotaOption"
        />
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { mapActions, mapMutations } from 'vuex'
import { useGraphClient } from 'web-client/src/composables'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'

export default defineComponent({
  name: 'SpaceQuotaModal',
  components: {
    QuotaSelect
  },
  props: {
    space: {
      type: Object,
      required: true
    },
    cancel: {
      type: Function,
      required: true
    }
  },
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
      return this.space.spaceQuota.total === this.selectedOption
    },
    modalTitle() {
      return this.$gettextInterpolate(this.$gettext('Change quota for space %{name}'), {
        name: this.space.name
      })
    }
  },
  mounted() {
    this.selectedOption = this.space.spaceQuota.total || 0
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    changeSelectedQuotaOption(option) {
      this.selectedOption = option.value
    },
    editQuota() {
      return this.graphClient.drives
        .updateDrive(this.space.id, { quota: { total: this.selectedOption } }, {})
        .then(({ data }) => {
          this.cancel()
          this.UPDATE_SPACE_FIELD({
            id: this.space.id,
            field: 'spaceQuota',
            value: data.quota
          })
          this.UPDATE_RESOURCE_FIELD({
            id: this.space.id,
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
    }
  }
})
</script>
