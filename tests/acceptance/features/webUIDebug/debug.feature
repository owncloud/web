Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has created folder "simple-empty-folder" in the server
    And user "Brian" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Brian" has uploaded file "data.zip" to "data.zip" in the server
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |


  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |

  Scenario: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Custom permissions" with permissions "update, share" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, share   |
