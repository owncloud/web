describe('PublicLink', () => {
  describe('theming options', () => {
    test.todo('should have the background image set')
    test.todo('should display the page title')
    test.todo('should display the logo image inside login card')
    test.todo('should display the configuration theme general slogan as the login card footer')
  })

  describe('when the view is still loading', () => {
    test.todo('should display the loading text with the spinner')
    test.todo('should not display the error message')
    test.todo('should not display the password required form')
  })

  describe('when the view is not loading anymore', () => {
    test.todo('should not display the loading text and the spinner')
    test.todo('should display the error message if "errorMessage" is not empty')

    describe('when "passwordRequired" is set as true', () => {
      test.todo('should display the password required form')

      describe('password input', () => {
        test.todo('should have a computed label')
        test.todo('should display the error message if "inputErrorMessage" is not empty')
        test.todo('should not display the error message if "inputErrorMessage" is falsy')
      })

      describe('submit button', () => {
        test.todo('should be set as disabled if "password" is empty')
        test.todo('should be set as enabled if "password" is not empty')
      })
    })
  })
})
