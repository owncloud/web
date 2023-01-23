/**
 * There are some errors that should be caught but sneaked by vue.
 * Vue Warn errors is one of them
 *
 * Global console contains these error from where we can assert if they are expected errors
 */
console.error = function (message) {
  if (typeof message === 'string' && message.includes('Vue warn')) {
    // keep default behaviour
    // error.apply(console, arguments)
    // Vue warn contains messages with warning initiator element
    // Only vue warn message is thrown leaving the initiator element description
    const errorSplit = message.split('\n')
    throw errorSplit[0]
  } else {
    throw message instanceof Error ? message : new Error(message)
  }
}

export {}
