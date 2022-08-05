Feature: copy files and folders
  As a user
  I want to copy files and folders
  So that I can work safely on a copy without changing the original

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has been created with default attributes and without skeleton files in the server


  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @smokeTest @ocisSmokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

