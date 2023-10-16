  Feature: Search
  As a user
  I want to search for resources
  So that I can find them quickly

  Scenario: Search in personal spaces
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Brian" logs in
    And "Brian" creates the following folder in personal space using API
      | name                 |
      | new_share_from_brian |
    And "Brian" uploads the following local file into personal space using API
      | localFile                        | to                |
      | filesForUpload/new-lorem-big.txt | new-lorem-big.txt |
    And "Brian" opens the "files" app
    And "Brian" shares the following resource using the sidebar panel
      | resource             | recipient | type | role     | resourceType |
      | new_share_from_brian | Alice     | user | Can view | folder       |
      | new-lorem-big.txt    | Alice     | user | Can view | file         |
    And "Brian" logs out

    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource                   | type   |
      | folder                     | folder |
      | FolDer/child-one/child-two | folder |
      | strängéनेपालीName          | folder |
    And "Alice" enables the option to display the hidden file
    And "Alice" uploads the following resources
      | resource         |
      | .hidden-file.txt |

    # search for objects of personal space
    When "Alice" searches "foldeR" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource |
      | folder   |
      | FolDer   |
    But following resources should not be displayed in the search list for user "Alice"
      | resource             |
      | new_share_from_brian |
      | new-lorem-big.txt    |
      | .hidden-file.txt     |

    # search for hidden file
    When "Alice" searches "hidden" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource         |
      | .hidden-file.txt |
    But following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | folder            |
      | FolDer            |
      | PARENT            |
      | new-lorem-big.txt |

    # subfolder search
    And "Alice" searches "child" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource  |
      | child-one |
      | child-two |
    But following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | folder            |
      | FolDer            |
      | folder_from_brian |
      | .hidden-file.txt  |
      | new-lorem-big.txt |

    # received shares search
    And "Alice" searches "NEW" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource             |
      | new_share_from_brian |
      | new-lorem-big.txt    |
    But following resources should not be displayed in the search list for user "Alice"
      | resource         |
      | folder           |
      | FolDer           |
      | .hidden-file.txt |
    And "Alice" opens the "files" app

    # search renamed resources
    When "Alice" renames the following resource
      | resource | as            |
      | folder   | renamedFolder |
      | FolDer   | renamedFolDer |
    And "Alice" searches "rena" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource      |
      | renamedFolder |
      | renamedFolDer |
    But following resources should not be displayed in the search list for user "Alice"
      | resource |
      | folder   |
      | FolDer   |


    # search difficult names
    When "Alice" searches "strängéनेपालीName" using the global search and the "everywhere" filter and presses enter
    Then following resources should be displayed in the files list for user "Alice"
      | strängéनेपालीName |

    # deleting folder from search result and search deleted resource
    When "Alice" deletes the following resource using the sidebar panel
      | resource          | from |
      | strängéनेपालीName |      |
    And "Alice" searches "forDeleting" using the global search and the "everywhere" filter
    Then following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | strängéनेपालीName |

    And "Alice" navigates to the shared with me page
    When "Alice" reshares the following resource
      | resource             | recipient | type | role     | resourceType |
      | new_share_from_brian | Carol     | user | Can view | folder       |
      | new-lorem-big.txt    | Carol     | user | Can view | file         |
    And "Alice" logs out

    # search re-shared resources
    When "Carol" logs in
    And "Carol" opens the "files" app
    And "Carol" creates the following resources
      | resource | type   |
      | folder   | folder |
    And "Carol" searches "NEW" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Carol"
      | resource             |
      | new_share_from_brian |
      | new-lorem-big.txt    |
    But following resources should not be displayed in the search list for user "Carol"
      | resource |
      | folder   |
    And "Carol" logs out


  Scenario: Search using "current folder" filter
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name                 |
      | mainFolder/subFolder |
    And "Alice" creates the following files into personal space using API
      | pathToFile                                         | content                   |
      | exampleInsideThePersonalSpace.txt                  | I'm in the personal Space |
      | mainFolder/exampleInsideTheMainFolder.txt          | I'm in the main folder    |
      | mainFolder/subFolder/exampleInsideTheSubFolder.txt | I'm in the sub folder     |
    And "Alice" opens the "files" app
    When "Alice" opens folder "mainFolder"
    And "Alice" searches "example" using the global search and the "everywhere" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource                          |
      | exampleInsideThePersonalSpace.txt |
      | exampleInsideTheMainFolder.txt    |
      | exampleInsideTheSubFolder.txt     |

    When "Alice" searches "example" using the global search and the "in here" filter
    Then following resources should be displayed in the search list for user "Alice"
      | resource                       |
      | exampleInsideTheMainFolder.txt |
      | exampleInsideTheSubFolder.txt  |
    But following resources should not be displayed in the search list for user "Alice"
      | resource                          |
      | exampleInsideThePersonalSpace.txt |
    And "Alice" logs out
