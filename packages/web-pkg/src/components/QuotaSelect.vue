<template>
  <div>
    <oc-select
      ref="select"
      :model-value="selectedOption"
      :selectable="optionSelectable"
      taggable
      push-tags
      :clearable="false"
      :options="options"
      :create-option="createOption"
      option-label="value"
      :label="title"
      @update:model-value="onUpdate"
    >
      <template #selected-option="{ value }">
        <span v-if="value === 0" v-text="$gettext('No restriction')" />
        <span v-else>{{ getFormattedFileSize(value) }}</span>
      </template>
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" v-on="events" />
      </template>
      <template #option="{ value, error }">
        <div class="oc-flex oc-flex-between">
          <span v-if="value === 0" v-text="$gettext('No restriction')" />
          <span v-else>{{ getFormattedFileSize(value) }}</span>
        </div>
        <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
      </template>
    </oc-select>
    <p
      class="oc-mt-xs oc-text-meta"
      v-text="$gettext('Select a quota option or enter your own value')"
    />
  </div>
</template>

<script lang="ts">
import { formatFileSize } from 'web-pkg'

export default {
  name: 'QuotaSelect',
  props: {
    title: {
      type: String,
      required: true
    },
    totalQuota: {
      type: Number,
      default: 0
    },
    maxQuota: {
      type: Number,
      default: 0
    }
  },
  emits: ['selectedOptionChange'],
  data: function () {
    return {
      selectedOption: undefined,
      options: []
    }
  },
  computed: {
    quotaLimit() {
      return this.maxQuota || 1e15
    },
    DEFAULT_OPTIONS() {
      return [
        {
          value: Math.pow(10, 9)
        },
        {
          value: 2 * Math.pow(10, 9)
        },
        {
          value: 5 * Math.pow(10, 9)
        },
        {
          value: 10 * Math.pow(10, 9)
        },
        {
          value: 50 * Math.pow(10, 9)
        },
        {
          value: 100 * Math.pow(10, 9)
        },
        {
          value: 0
        }
      ]
    }
  },
  watch: {
    totalQuota() {
      const selectedOption = this.options.find((o) => o.value === this.totalQuota)
      if (selectedOption) {
        this.selectedOption = selectedOption
      }
    }
  },
  mounted() {
    this.setOptions()
    this.selectedOption = this.options.find((o) => o.value === this.totalQuota)
  },
  methods: {
    onUpdate(event) {
      this.selectedOption = event
      this.$emit('selectedOptionChange', this.selectedOption)
    },
    optionSelectable(option) {
      return option.selectable !== false
    },
    isValueValidNumber(value) {
      const optionIsNumberRegex = /^[0-9]\d*(([.,])\d+)?$/g
      return value !== '0' && optionIsNumberRegex.test(value)
    },
    createOption(option) {
      option = option.replace(',', '.')

      if (!this.isValueValidNumber(option)) {
        return {
          value: option,
          error: this.$gettext('Please enter only numbers'),
          selectable: false
        }
      }
      const value = parseFloat(option) * Math.pow(10, 9)

      if (value > this.quotaLimit) {
        return {
          value,
          error: this.$gettext('Please enter a value equal to or less than %{ quotaLimit }', {
            quotaLimit: this.getFormattedFileSize(this.quotaLimit)
          }),

          selectable: false
        }
      }

      return {
        value
      }
    },
    setOptions() {
      let availableOptions = [...this.DEFAULT_OPTIONS]

      if (this.maxQuota) {
        availableOptions = availableOptions.filter((availableOption) => {
          if (this.totalQuota === 0 && availableOption.value === 0) {
            availableOption.selectable = false
            return true
          }
          return availableOption.value !== 0 && availableOption.value <= this.maxQuota
        })
      }

      const selectedQuotaInOptions = availableOptions.find(
        (option) => option.value === this.totalQuota
      )

      if (!selectedQuotaInOptions) {
        availableOptions.push({
          value: this.totalQuota,
          selectable: this.totalQuota <= this.quotaLimit
        })
      }

      // Sort options and make sure that unlimited is at the end
      availableOptions = [
        ...availableOptions.filter((o) => o.value).sort((a, b) => a.value - b.value),
        ...availableOptions.filter((o) => !o.value)
      ]
      this.options = availableOptions
    },
    getFormattedFileSize(value) {
      const formattedFilesize = formatFileSize(value, this.$language.current)
      return !this.isValueValidNumber(value) ? value : formattedFilesize
    }
  }
}
</script>
