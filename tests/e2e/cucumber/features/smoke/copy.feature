Feature: Upload
  As a user
  I want to upload resources
  So that I can store them in owncloud

  Scenario: Copy resources in personal space
    Given "Admin" creates following users
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource                 | type    | content                        |
      | PARENTCopy/ba            | folder  |                                |
      | PARENTCopy2              | folder  |                                |
#      | PARENT/apple/example.txt | txtFile | example text                   |
      | KeyboardExample.txt      | txtFile | copy with the help of keyboard |
#    When "Alice" copies the following resource using the sidebar panel
#      | resource                 | to                     |
#      | PARENT/apple/example.txt | Personal/PARENTCopy/ba |
    # currently copy/paste feature not available in playwright
    # https://github.com/microsoft/playwright/issues/8114#issuecomment-1191977124
    And "Alice" copies the following resource using the keyboard
      | resource            | to                     |
      | KeyboardExample.txt | Personal/PARENTCopy/ba |
