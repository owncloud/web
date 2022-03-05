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
        <oc-select
          v-model="selectedOption"
          :selectable="optionSelectable"
          taggable
          push-tags
          :clearable="false"
          :options="options"
          :create-option="createOption"
          option-label="displayValue"
          :label="$gettext('Space quota')"
        >
          <template #selected-option="{ displayValue, displayUnit }">
            <span>{{ displayValue }}</span>
            <span v-if="displayUnit" class="oc-text-muted oc-ml-s">{{ displayUnit }}</span>
          </template>
          <template #search="{ attributes, events }">
            <input class="vs__search" v-bind="attributes" v-on="events" />
          </template>
          <template #option="{ displayValue, displayUnit, error }">
            <div class="oc-flex oc-flex-between">
              <span>{{ displayValue }}</span>
              <span v-if="displayUnit" class="oc-text-muted">{{ displayUnit }}</span>
            </div>
            <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
          </template>
        </oc-select>
        <p
          class="oc-mt-xs oc-text-meta"
          v-text="$gettext('Select a quota option or enter your own value')"
        />
      </template>
    </oc-modal>
  </portal>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  name: 'SpaceQuotaModal',
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
  data: function () {
    return {
      selectedOption: {},
      options: [],
      DEFAULT_OPTIONS: [
        {
          displayValue: '1',
          displayUnit: 'GB',
          value: Math.pow(10, 9)
        },
        {
          displayValue: '5',
          displayUnit: 'GB',
          value: 5 * Math.pow(10, 9)
        },
        {
          displayValue: '10',
          displayUnit: 'GB',
          value: 10 * Math.pow(10, 9)
        },
        {
          displayValue: '50',
          displayUnit: 'GB',
          value: 50 * Math.pow(10, 9)
        },
        {
          displayValue: '100',
          displayUnit: 'GB',
          value: 100 * Math.pow(10, 9)
        },
        {
          displayValue: '500',
          displayUnit: 'GB',
          value: 500 * Math.pow(10, 9)
        },
        {
          displayValue: '1000',
          displayUnit: 'GB',
          value: 10000 * Math.pow(10, 9)
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['getToken', 'configuration']),
    confirmButtonDisabled() {
      return this.space.spaceQuota.total === this.selectedOption.value
    },
    modalTitle() {
      return this.$gettextInterpolate(this.$gettext('Change quota for space %{name}'), {
        name: this.space.name
      })
    }
  },
  mounted() {
    this.setOptions()
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),

    editQuota() {
      const newTotalQuota = this.selectedOption.value

      if (isNaN(newTotalQuota)) {
        return this.showMessage({
          title: this.$gettext('Changing space quota failed…'),
          status: 'danger'
        })
      }

      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(this.space.id, { quota: { total: this.selectedOption.value } }, {})
        .then(({ data }) => {
          this.cancel()
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
            desc: error,
            status: 'danger'
          })
        })
    },
    optionSelectable(option) {
      if (!option.value) {
        return false
      }

      return !isNaN(option.value)
    },
    createOption(option) {
      if (option.endsWith('.') || option.endsWith(',')) {
        option = option.slice(0, -1)
      }

      const optionIsNumberRegex = /^[1-9]\d*(([.,])\d+)?$/g

      if (!optionIsNumberRegex.test(option)) {
        return {
          displayValue: option,
          error: this.$gettext('Please enter only numbers')
        }
      }

      option = option.replace(',', '.')
      return {
        displayValue: parseFloat(option).toFixed(2).toString().replace('.00', ''),
        displayUnit: 'GB',
        value: parseFloat(option).toFixed(2) * Math.pow(10, 9)
      }
    },
    setOptions() {
      this.options = [...this.DEFAULT_OPTIONS]

      const selectedQuotaInOptions = this.options.find(
        (option) => option.value === this.space.spaceQuota.total
      )

      if (selectedQuotaInOptions) {
        this.selectedOption = selectedQuotaInOptions
      } else {
        const newOption = {
          displayValue: (this.space.spaceQuota.total * Math.pow(10, -9))
            .toFixed(2)
            .toString()
            .replace('.00', ''),
          displayUnit: 'GB',
          value: this.space.spaceQuota.total
        }
        this.options.push(newOption)
        this.options = [
          ...this.options.filter((o) => o.value).sort((a, b) => a.value - b.value),
          ...this.options.filter((o) => !o.value)
        ]
        this.selectedOption = newOption
      }
    }
  }
}
</script>
