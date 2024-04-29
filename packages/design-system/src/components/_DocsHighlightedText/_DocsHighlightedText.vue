<template>
  <component :is="tag">
    <template v-for="(fragments, lineIndex) in lines">
      <span
        v-for="(fragment, fragmentIndex) in fragments"
        :key="'line-' + lineIndex + '-fragment-' + fragmentIndex"
      >
        <!-- eslint-disable vue/no-v-for-template-key-on-child -->
        <component
          :is="fragment.tag"
          :style="{
            display:
              fragment.value.startsWith(' ') || fragment.value.endsWith(' ')
                ? 'inline'
                : 'inline-block'
          }"
          :class="{ 'highlighted-fragment': fragment.highlighted }"
        >
          {{ fragment.value }}
        </component>
      </span>
      <br v-if="lineIndex < lines.length - 1" :key="'line-' + lineIndex + '-br'" />
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DocsHighlightedText',
  props: {
    tag: {
      type: String,
      default: 'span'
    },
    fragmentTag: {
      type: String,
      default: 'span',
      validator: function (value: string) {
        return ['span', 'i', 'em', 'b', 'strong'].includes(value)
      }
    },
    value: {
      type: String,
      required: true
    },
    highlighted: {
      type: String,
      default: null
    }
  },
  computed: {
    lines() {
      const regex = new RegExp('\\n')
      const lines = this.value.split(regex)
      return lines
        .filter((line, index) => {
          // note: split creates an empty first and last element. this removes those (if they are really empty)
          return !((index === 0 || index === lines.length - 1) && !line.length)
        })
        .map((line) => this.buildFragments(line))
    }
  },
  methods: {
    buildFragments(line: string) {
      if (this.highlighted) {
        const regex = new RegExp('(' + this.highlighted + ')', 'gi')
        const textFragments = line.split(regex)
        if (textFragments.length > 1) {
          return textFragments.map((fragment) => {
            return {
              tag: this.fragmentTag,
              value: fragment,
              highlighted: fragment.match(regex)
            }
          })
        }
      }
      // if not highlighting or no matches found (i.e. result = whole value), return a single fragment
      return [
        {
          tag: this.fragmentTag,
          value: line,
          highlighted: false
        }
      ]
    }
  }
})
</script>

<style lang="scss">
.highlighted-fragment {
  background-color: yellow;
}
</style>
