Feature: spaces.personal

  Scenario: unstructured collection of testable space interactions,
  once all needed features are there, split this into independent tests.
  contains following features:
  - ✓ assign role to user
  - ✓ create space & internal alias to differentiate multiple spaces with the same name
  - ✓ open space
  - ✓ rename space
  - ✓ change/set space subtitle
  - ✓ change/set space description
  - ✓ change/set space quota
  - ✓ resources & existing resource actions
  - ✓ change/set space image
  - ✗ trash bin
  - ✗ share
  - ✗ link
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    Then "Admin" assigns following roles to the users
      | id    | role       |
      | Alice | SpaceAdmin |
    And "Alice" creates the following project spaces using API
      | name  | id     |
      | team  | team.1 |
      | team2 | team.2 |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page

    # team.1
    And "Alice" navigates to the project space "team.1"
    And "Alice" updates the space "team.1" name to "developer team"
    And "Alice" updates the space "team.1" subtitle to "developer team - subtitle"
    And "Alice" updates the space "team.1" description to "developer team - description"
    And "Alice" updates the space "team.1" quota to "50"
    And "Alice" updates the space "team.1" image to "testavatar.png"

    # shared examples
    And "Alice" creates the following resources
      | resource         | type   |
      | folderPublic     | folder |
      | folder_to_shared | folder |
    And "Alice" uploads the following resources
      | resource  | to               |
      | lorem.txt | folderPublic     |
      | lorem.txt | folder_to_shared |

    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "team.1"
    And "Alice" edits the public link named "team.1" of resource "folderPublic" changing role to "uploader"
    And "Alice" sets the expiration date of the public link named "team.1" of resource "folderPublic" to "+5 days"
    And "Alice" sets the password of the public link named "team.1" of resource "folderPublic" to "12345"

    # borrowed from share.feature
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   |
      | folder_to_shared | Brian     | user | editor |

    # team.2
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.2"
    And "Alice" updates the space "team.2" name to "management team"
    And "Alice" updates the space "team.2" subtitle to "management team - subtitle"
    And "Alice" updates the space "team.2" description to "management team - description"
    And "Alice" updates the space "team.2" quota to "500"
    And "Alice" updates the space "team.2" image to "sampleGif.gif"

    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |

    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "team.2"
    And "Alice" edits the public link named "team.2" of resource "folderPublic" changing role to "uploader"
    And "Alice" sets the expiration date of the public link named "team.2" of resource "folderPublic" to "+5 days"
    And "Alice" sets the password of the public link named "team.2" of resource "folderPublic" to "54321"

    # borrowed from link.feature, all existing resource actions can be reused
    When "Anonymous" opens the public link "team.1"
    And "Anonymous" unlocks the public link with password "12345"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |

    # borrowed from share.feature
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name             |
      | folder_to_shared |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" updates the space "team.1" image to "testavatar.jpeg"
    And "Alice" uploads the following resource
      | resource          | to               | option  |
      | PARENT/simple.pdf | folder_to_shared | replace |
    When "Brian" restores following resources
      | resource   | to               | version |
      | simple.pdf | folder_to_shared | 1       |
    When "Alice" deletes the following resources
      | resource                       |
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared               |
    And "Brian" logs out

    # alice is done
    When "Alice" logs out

    # borrowed from link.feature, all existing resource actions can be reused
    When "Anonymous" opens the public link "team.2"
    And "Anonymous" unlocks the public link with password "54321"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |

    # anonymous is done
    When "Anonymous" logs out


