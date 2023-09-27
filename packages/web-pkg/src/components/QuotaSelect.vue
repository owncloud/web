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
      option-label="displayValue"
      v-bind="$attrs"
      @update:model-value="onUpdate"
    >
      <template #selected-option="{ displayValue }">
        <oc-icon v-if="$attrs['read-only']" name="lock" class="oc-mr-xs" size="small" />
        <span v-text="displayValue" />
      </template>
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" v-on="events" />
      </template>
      <template #option="{ displayValue, error }">
        <div class="oc-flex oc-flex-between">
          <span v-text="displayValue" />
        </div>
        <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
      </template>
    </oc-select>
  </div>
</template>

<script lang="ts">
import { formatFileSize } from '@ownclouders/web-pkg'

export default {
  name: 'QuotaSelect',
  props: {
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
    DEFAULT_OPTIONS(): { value: number; displayValue: string; selectable?: boolean }[] {
      return [
        {
          value: Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(Math.pow(10, 9))
        },
        {
          value: 2 * Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(2 * Math.pow(10, 9))
        },
        {
          value: 5 * Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(5 * Math.pow(10, 9))
        },
        {
          value: 10 * Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(10 * Math.pow(10, 9))
        },
        {
          value: 50 * Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(50 * Math.pow(10, 9))
        },
        {
          value: 100 * Math.pow(10, 9),
          displayValue: this.getFormattedFileSize(100 * Math.pow(10, 9))
        },
        {
          displayValue: this.$gettext('No restriction'),
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
      return optionIsNumberRegex.test(value) && value > 0
    },
    createOption(option) {
      option = option.replace(',', '.')

      if (!this.isValueValidNumber(option)) {
        return {
          displayValue: option,
          value: option,
          error: this.$gettext('Please enter only numbers'),
          selectable: false
        }
      }
      const value = parseFloat(option) * Math.pow(10, 9)

      if (value > this.quotaLimit) {
        return {
          value,
          displayValue: this.getFormattedFileSize(value),
          error: this.$gettext('Please enter a value equal to or less than %{ quotaLimit }', {
            quotaLimit: this.getFormattedFileSize(this.quotaLimit)
          }),

          selectable: false
        }
      }

      return {
        value,
        displayValue: this.getFormattedFileSize(value)
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
          displayValue: this.getFormattedFileSize(this.totalQuota),
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
