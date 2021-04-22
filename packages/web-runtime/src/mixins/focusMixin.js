const tape = []
const isDomNode = node => node instanceof Element
const DIRECTION_FORWARD = 'forward'
const DIRECTION_BACKWARD = 'backward'

export default {
  methods: {
    focus({ from, to, revert }) {
      const direction = revert ? DIRECTION_BACKWARD : DIRECTION_FORWARD

      if (from && direction === DIRECTION_FORWARD) {
        tape.splice(0, tape.length)
      } else {
        from = document.activeElement
      }

      if (direction === DIRECTION_FORWARD) {
        tape.push(from)
      }

      if (direction === DIRECTION_BACKWARD) {
        to = tape.pop()
      }

      if (isDomNode(to)) {
        to.focus()
      }
    }
  }
}
