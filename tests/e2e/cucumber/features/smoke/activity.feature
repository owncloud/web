Feature: Users can see all activities of the resources and spaces

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |

  Scenario: activity
    Given "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" adds the following members to the space "team" using API
      | user  | role     | shareType |
      | Brian | Can view | user      |
    And "Alice" creates a public link of the space using API
      | space | name       | password |
      | team  | space link | %public% |
    And "Alice" creates the following folder in personal space using API
      | name                   |
      | sharedFolder/subFolder |
    And "Alice" uploads the following local file into personal space using API
      | localFile                   | to                        |
      | filesForUpload/textfile.txt | sharedFolder/textfile.txt |
    And "Alice" shares the following resource using API
      | resource     | recipient | type | role                      |
      | sharedFolder | Brian     | user | Can edit without versions |
    And "Alice" creates a public link of following resource using API
      | resource     | role                      | password |
      | sharedFolder | Can edit without versions | %public% |

    When "Anonymous" opens the public link "Unnamed link"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" edits the following resources
      | resource     | content     |
      | textfile.txt | new content |
    Then "Anonymous" should not see any activity of the following resource
      | resource     |
      | textfile.txt |

    And "Alice" logs in
    And "Alice" renames the following resource
      | resource                  | as      |
      | sharedFolder/textfile.txt | new.txt |
    And "Alice" deletes the following resource using the sidebar panel
      | resource  | from         |
      | subFolder | sharedFolder |
    Then "Alice" should see activity of the following resource
      | resource     | activity                                                                 |
      | sharedFolder | %user_alice_displayName% deleted subFolder from sharedFolder             |
      | sharedFolder | %user_alice_displayName% renamed textfile.txt to new.txt                 |
      | sharedFolder | Public updated textfile.txt in sharedFolder                              |
      | sharedFolder | %user_alice_displayName% shared sharedFolder via link                    |
      | sharedFolder | %user_alice_displayName% shared sharedFolder with brian                  |
      | sharedFolder | %user_alice_displayName% added textfile.txt to sharedFolder              |
      | sharedFolder | %user_alice_displayName% added subFolder to sharedFolder                 |
      | sharedFolder | %user_alice_displayName% added sharedFolder to %user_alice_displayName%  |

      | sharedFolder/new.txt | %user_alice_displayName% renamed textfile.txt to new.txt         |
      | new.txt              | Public updated textfile.txt in sharedFolder                      |
      | new.txt              | %user_alice_displayName% added textfile.txt to sharedFolder      |
    And "Alice" logs out

    # see activity in the project space
    When "Brian" logs in
    And "Brian" navigates to the project space "team.1"
    Then "Brian" should see activity of the space
      | activity                                               |
      | %user_alice_displayName% shared team via link          |
      | %user_alice_displayName% added brian as member of team |
      | %user_alice_displayName% added readme.md to .space     |

    # see activity in the shared resources
    When "Brian" navigates to the shared with me page
    Then "Brian" should not see any activity of the following resource
      | resource             |
      | sharedFolder/new.txt |
    And "Brian" logs out
