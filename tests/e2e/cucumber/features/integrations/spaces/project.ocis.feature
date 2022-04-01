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
  - ✗ change/set space image
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
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
      | team | team.2 |

    # team.1
    And "Alice" navigates to the project space "team.1"
    And "Alice" updates the space "team.1" name to "developer team"
    And "Alice" updates the space "team.1" subtitle to "developer team - subtitle"
    And "Alice" updates the space "team.1" description to "developer team - description"
    And "Alice" updates the space "team.1" quota to "50"

    # shared examples
    And "Alice" creates the following resources
      | resource         | type   |
      | folderPublic     | folder |
      | folder_to_shared | folder |
    And "Alice" uploads the following resources
      | resource  | to               |
      | lorem.txt | folderPublic     |
      | lorem.txt | folder_to_shared |

    # borrowed from link.feature, all existing resource actions can be reused
    When "Alice" creates a public link for the following resource using the sidebar panel
      | resource     | name   | role     | dateOfExpiration | password |
      | folderPublic | team.1 | uploader | +5 days          | 12345    |

    # borrowed from share.feature
    When "Alice" shares the following resource using the sidebar panel
      | resource         | user  | role   |
      | folder_to_shared | Brian | editor |

    # team.2
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.2"
    And "Alice" updates the space "team.2" name to "management team"
    And "Alice" updates the space "team.2" subtitle to "management team - subtitle"
    And "Alice" updates the space "team.2" description to "management team - description"
    And "Alice" updates the space "team.2" quota to "500"

      # borrowed from link.feature, all existing resource actions can be reused
    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |
    When "Alice" creates a public link for the following resource using the sidebar panel
      | resource     | name   | role     | dateOfExpiration | password |
      | folderPublic | team.2 | uploader | +5 days          | 54321    |

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
    And "Brian" navigates to the personal space page
    And "Brian" renames the following resource
      | resource                          | as            |
      | Shares/folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to                      |
      | simple.pdf | Shares/folder_to_shared |
    And "Brian" copies the following resource
      | resource                | to       |
      | Shares/folder_to_shared | Personal |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" uploads the following resource
      | resource          | to               | create_version |
      | PARENT/simple.pdf | folder_to_shared | true           |
    When "Brian" restores following resources
      | resource   | to                      | version |
      | simple.pdf | Shares/folder_to_shared | 1       |
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


