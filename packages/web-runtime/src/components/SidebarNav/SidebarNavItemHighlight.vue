<template>
  <span v-if="initial" id="highlighter" :data-initial-id="index" />
</template>
<script>
export default {
  props: {
    index: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      initial: false
    }
  },
  watch: {
    active(active) {
      if (!active) return
      this.animateHighlightPosition(this.index)
    }
  },
  created() {
    if (!this.active) return
    this.initial = true
  },
  methods: {
    animateHighlightPosition(target, durationSeconds = 0.2) {
      const initialId = this.getInitialId()
      const currentElement = this.getNavigationItem(initialId)
      const targetElement = this.getNavigationItem(target)
      const distanceAbs = this.getDistanceBetweenElements(currentElement, targetElement)
      const distance = target < initialId ? -distanceAbs : distanceAbs
      const style = this.getHighlightingElement().style
      style.setProperty('transition-duration', `${durationSeconds}s`)
      style.setProperty('transform', `translateY(${distance}px)`)
    },
    getNavigationItem(index) {
      return document.querySelectorAll(`[data-nav-id="${index}"]`)[0]
    },
    getPositionAtCenter(element) {
      const { top, left, width, height } = element.getBoundingClientRect()
      return {
        x: left + width / 2,
        y: top + height / 2
      }
    },
    getDistanceBetweenElements(a, b) {
      const aPosition = this.getPositionAtCenter(a)
      const bPosition = this.getPositionAtCenter(b)
      return Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y)
    },
    getHighlightingElement() {
      return document.getElementById('highlighter')
    },
    getInitialId() {
      return this.getHighlightingElement().getAttribute('data-initial-id')
    }
  }
}
</script>

<style lang="scss">
#highlighter {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #0869de 0%, #4e85c8 100%);
  transition: transform 0.2s cubic-bezier(0.51, 0.06, 0.56, 1.37);
  border-radius: 5px;
  z-index: -1;
}
#highlighter::before {
	content: "";
	position: absolute;
	width: 45px;
	top: 0;
	bottom: 0;
	left: 0;
	box-shadow: 2px 0px 6px rgba(0, 0, 0, 0.14);
}
</style>
