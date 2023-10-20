Feature: spaces public link

  Scenario: public link for space
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | David |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    When "Alice" logs in
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" creates the following folder in space "team" using API
      | name                  |
      | spaceFolder/subFolder |
    And "Alice" creates the following file in space "team" using API
      | name                                  | content   |
      | spaceFolder/shareToBrian.txt          | some text |
      | spaceFolder/subFolder/shareToBrian.md | readme    |
    And "Alice" adds the following members to the space "team" using API
      | user  | role       | shareType |
      | Brian | Can edit   | space     |
      | Carol | Can view   | space     |
      | David | Can manage | space     |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" uploads the following resources via drag-n-drop
      | resource       |
      | simple.pdf     |
      | testavatar.jpg |
    And "Alice" creates a public link for the space using the sidebar panel
    And "Alice" renames the most recently created public link of space to "spaceLink"
    And "Alice" creates a public link for the resource "spaceFolder" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "spaceFolder" to "folderLink"
    And "Alice" creates a public link for the resource "spaceFolder/shareToBrian.txt" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "spaceFolder/shareToBrian.txt" to "textLink"
    And "Alice" creates a public link for the resource "spaceFolder/subFolder/shareToBrian.md" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "spaceFolder/subFolder/shareToBrian.md" to "markdownLink"
    And "Alice" creates a public link for the resource "simple.pdf" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "simple.pdf" to "pdfLink"
    And "Alice" creates a public link for the resource "testavatar.jpg" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "testavatar.jpg" to "imageLink"
    And "Alice" logs out
    When "Brian" logs in
    And "Brian" opens the public link "spaceLink"
    Then "Brian" should not be able to edit the public link named "spaceLink"
    And "Brian" should not be able to edit the public link named "folderLink"
    When "Brian" opens the public link "textLink"
    Then for "Brian" file "shareToBrian.txt" should be selected
    When "Brian" opens the public link "markdownLink"
    Then for "Brian" file "shareToBrian.md" should be selected
    And "Brian" logs out
    When "Carol" logs in
    And "Carol" opens the public link "spaceLink"
    But "Carol" should not be able to edit the public link named "spaceLink"
    And "Carol" should not be able to edit the public link named "folderLink"
    When "Carol" opens the public link "folderLink"
    Then "Carol" should see folder "subFolder" but should not be able to edit
    When "Carol" opens the public link "pdfLink"
    Then for "Carol" file "simple.pdf" should be selected
    And "Carol" logs out
    When "David" logs in
    And "David" opens the public link "spaceLink"
    And "David" edits the public link named "spaceLink" of the space changing role to "Can edit"
    And "David" edits the public link named "folderLink" of resource "spaceFolder" changing role to "Can edit"
    When "David" opens the public link "imageLink"
    Then for "David" file "testavatar.jpg" should be selected
    And "David" logs out


  Scenario: add banned password for public link
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" uploads the following resources
      | resource  |
      | lorem.txt |
    And "Alice" creates a public link for the resource "lorem.txt" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "lorem.txt" to "myPublicLink"
    When "Alice" tries to sets the password of the public link named "myPublicLink" of resource "lorem.txt" to "password"
    Then "Alice" should see an error message
      """
      Unfortunately, your password is commonly used. please pick a harder-to-guess password for your safety
      """
    And "Alice" closes the public link password dialog box
    When "Alice" tries to sets the password of the public link named "myPublicLink" of resource "lorem.txt" to "12345678"
    Then "Alice" should see an error message
      """
      Unfortunately, your password is commonly used. please pick a harder-to-guess password for your safety
      """
    And "Alice" reveals the password of the public link
    And "Alice" hides the password of the public link
    And "Alice" generates the password for the public link
    And "Alice" copies the password of the public link
    And "Alice" sets the password of the public link
    And "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "%copied_password%"
    And "Alice" logs out
