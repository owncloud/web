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
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    When "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name  | id     |
      | team  | team.1 |
      | team2 | team.2 |

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

    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | role             | password |
      | folderPublic | Secret File Drop | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic" to "team.1"
    And "Alice" sets the expiration date of the public link named "team.1" of resource "folderPublic" to "+5 days"

    # borrowed from share.feature
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role                      | resourceType |
      | folder_to_shared | Brian     | user | Can edit without versions | folder       |

    # team.2
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

    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | password |
      | folderPublic | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic" to "team.2"
    And "Alice" edits the public link named "team.2" of resource "folderPublic" changing role to "Secret File Drop"
    And "Alice" sets the expiration date of the public link named "team.2" of resource "folderPublic" to "+5 days"
    And "Alice" changes the password of the public link named "team.2" of resource "folderPublic" to "new-strongPass1"

    # borrowed from link.feature, all existing resource actions can be reused
    When "Anonymous" opens the public link "team.1"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |

    # borrowed from share.feature
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    And "Alice" navigates to the project space "team.1"
    And "Alice" updates the space "team.1" image to "testavatar.jpeg"
    And "Alice" uploads the following resource
      | resource          | to               | option  |
      | PARENT/simple.pdf | folder_to_shared | replace |
    And "Brian" should not see the version panel for the file
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Alice" deletes the following resources using the sidebar panel
      | resource         | from             |
      | lorem_new.txt    | folder_to_shared |
      | folder_to_shared |                  |
    And "Brian" logs out

    # alice is done
    When "Alice" logs out

    # borrowed from link.feature, all existing resource actions can be reused
    When "Anonymous" opens the public link "team.2"
    And "Anonymous" unlocks the public link with password "new-strongPass1"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |


  Scenario: members of the space can control the versions of the files
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following resources
      | resource            | type    | content             |
      | parent/textfile.txt | txtFile | some random content |
    When "Alice" uploads the following resources
      | resource     | to     | option  |
      | textfile.txt | parent | replace |
    And "Alice" adds following users to the project space
      | user  | role     | kind |
      | Carol | Can view | user |
      | Brian | Can edit | user |
    And "Alice" logs out

    When "Carol" logs in
    And "Carol" navigates to the project space "team.1"
    And "Carol" should not see the version panel for the file
      | resource     | to     |
      | textfile.txt | parent |
    And "Carol" logs out

    When "Brian" logs in
    And "Brian" navigates to the project space "team.1"
    And "Brian" downloads old version of the following resource
      | resource     | to     |
      | textfile.txt | parent |
    And "Brian" restores following resources version
      | resource     | to     | version | openDetailsPanel |
      | textfile.txt | parent | 1       | true             |
    And "Brian" logs out
