<template>
  <oc-button
    :class="['style-category-button', isOpen && 'button-box-shadow']"
    appearance="raw"
    @click="handleIsOpen"
  >
    <span class="button-description"
      ><oc-icon :name="iconName" :fill-type="isFillTypeLine ? 'line' : 'fill'" /> {{ name }}</span
    >
    <oc-icon :name="isOpen ? 'arrow-down-s' : 'arrow-right-s'" />
  </oc-button>
  <div v-if="isOpen">
    <div v-for="styleVariable in styles" :key="styleVariable.name" class="style-variables">
      <span class="description">
        <p>{{ styleVariable.name }}</p>
        <p>{{ styleVariable.value }}</p>
      </span>
      <input
        v-model="styleVariable.value"
        type="range"
        :min="styleVariable.minValue"
        :max="styleVariable.maxValue"
        steps="1"
        class="slider-bar"
        @input="handleUpdateValue(styleVariable.name, styleVariable.value)"
        @keydown="preventArrowKeys"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType, computed } from 'vue'
import { StyleCategoryEnum } from '../../helpers'
import { mapMutations } from 'vuex'
import { useStore } from 'web-pkg'

export default defineComponent({
  name: 'StyleCategory',
  props: {
    iconName: {
      type: String,
      default: '',
      required: true
    },
    name: {
      type: String,
      default: '',
      required: true
    },
    variableType: {
      type: Object as PropType<StyleCategoryEnum>,
      required: true
    },
    isFillTypeLine: {
      type: Boolean,
      default: false
    }
  },
  emits: ['valueChange'],
  setup(props) {
    const isOpen = ref(false)
    const store = useStore()

    const styles = computed(() => {
      switch (props.variableType) {
        case StyleCategoryEnum.General:
          return store.getters['Preview/customizeGeneral']
        case StyleCategoryEnum.FineTune:
          return store.getters['Preview/customizeFineTune']
        default:
          return []
      }
    })

    const handleIsOpen = () => {
      isOpen.value = !isOpen.value
    }

    return {
      isOpen,
      handleIsOpen,
      styles
    }
  },
  methods: {
    ...mapMutations('Preview', ['SET_ACTIVE_STYLES', 'RESET_STYLES']),
    handleUpdateValue(name: string, value: number) {
      this.SET_ACTIVE_STYLES({ name, value })
    },
    preventArrowKeys(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.style-category-button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 6px;
  border-radius: 8px;
  margin-top: 16px;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }
}

.button-description {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-box-shadow {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}
.style-variables {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
}

.description {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.slider-bar {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 5px;
    background-color: var(--oc-color-background-hover);
    cursor: pointer;
  }

  &::-moz-range-track {
    height: 4px;
    cursor: pointer;
  }

  &::-ms-track {
    height: 4px;
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    height: 8px;
    width: 8px;
    margin-top: -6px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    height: 8px;
    cursor: pointer;
  }

  &::-ms-thumb {
    height: 8px;
    cursor: pointer;
  }
}
</style>
