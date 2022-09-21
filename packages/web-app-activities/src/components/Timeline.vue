<template>
  <div class="timeline">
    <div v-for="activity in activities" :key="activity.ID" class="timeline__item">
      <oc-icon
        class="timeline__icon"
        size="large"
        :fill-type="activity.icon.fill"
        :name="activity.icon.name"
        :variation="activity.icon.variation"
      />
      <div class="timeline__content">
        <div class="card">
          <div class="card__header">
            <h4>{{ activity.title }}</h4>
            <oc-tag v-for="(tag, idx) in activity.tags" :key="idx" :rounded="true" size="small">
              {{ tag }}
            </oc-tag>
          </div>
          <div v-if="activity.body" class="card__body">
            {{ activity.body }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  props: {
    activities: {
      type: Array,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.timeline {
  $margin-after: 1.5rem;
  margin: 2rem;

  &__item {
    display: flex;
    position: relative;
    overflow: hidden;

    &:not(:last-child) {
      margin-bottom: $margin-after;

      &:before {
        border-left: var(--oc-color-background-highlight) 4px dashed;
        content: '';
        height: 100%;
        left: 15px;
        position: absolute;
        top: 45px;
      }
    }
  }

  &__content {
    flex: 1 1 auto;
    padding-left: 2rem;
  }
}

.card {
  $shared-padding: 20px;
  background-color: var(--oc-color-background-highlight);
  border-radius: 5px;
  margin-top: 1.2rem;

  &__header {
    padding: $shared-padding;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    & > * {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }

    h4 {
      margin: 0 auto 0 0 !important;
    }
  }

  &__body {
    padding: $shared-padding;
    border-top: var(--oc-color-background-default) 1px solid;
  }
}
</style>
