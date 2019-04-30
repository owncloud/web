Feature: Filter files/folders

  As a user
  I would like to filter files/folders
  So that I can make the file/folder list more clear

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  Scenario: folders should not be listed in the files home if the folders are filtered out
    When the user disables folder filter using the webUI
    Then these folders should not be listed on the webUI
      | entry_name                |
      | 'single'quotes            |
      | 0                         |
      | simple-empty-folder       |
      | simple-folder             |
      | strängé नेपाली folder empty |
      | strängé नेपाली folder       |
    But these files should be listed on the webUI
      | entry_name                 |
      | 'single'quotes.txt         |
      | block-aligned-plus-one.txt |
      | data.tar.gz                |
      | data.zip                   |
      | desktopapp.png             |
      | testimagelarge.svg         |

  Scenario: files should not be listed in the files home if the files are filtered out
    When the user disables file filter using the webUI
    Then these files should not be listed on the webUI
      | entry_name                 |
      | 'single'quotes.txt         |
      | block-aligned-plus-one.txt |
      | data.tar.gz                |
      | data.zip                   |
      | desktopapp.png             |
      | testimagelarge.svg         |
    But these folders should be listed on the webUI
      | entry_name                |
      | 'single'quotes            |
      | 0                         |
      | simple-empty-folder       |
      | simple-folder             |
      | strängé नेपाली folder empty |
      | strängé नेपाली folder       |

  Scenario: files should not be listed inside a folder if the files are filtered out
    When the user disables file filter using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    But folder "simple-empty-folder" should be listed on the webUI

  Scenario: folder should not be listed inside a folder if the folders are filtered out
    Given the user has opened folder "folder with space"
    When the user disables folder filter using the webUI
    Then folder "simple-empty-folder" should not be listed on the webUI
    But file "lorem.txt" should be listed on the webUI

  Scenario: folders should be listed when the folder filter is disabled and again enabled
    Given the user has disabled folder filter
    When the user enables folder filter using the webUI
    Then these folders should be listed on the webUI
      | entry_name                |
      | 'single'quotes            |
      | 0                         |
      | simple-empty-folder       |
      | simple-folder             |
      | strängé नेपाली folder empty |
      | strängé नेपाली folder       |
    And these files should be listed on the webUI
      | entry_name                 |
      | 'single'quotes.txt         |
      | block-aligned-plus-one.txt |
      | data.tar.gz                |
      | data.zip                   |
      | desktopapp.png             |
      | testimagelarge.svg         |

  Scenario: files should be listed when the file filter is disabled and again enabled
    Given the user has disabled file filter
    When the user enables file filter using the webUI
    Then these files should be listed on the webUI
      | entry_name                |
      | 'single'quotes            |
      | 0                         |
      | simple-empty-folder       |
      | simple-folder             |
      | strängé नेपाली folder empty |
      | strängé नेपाली folder       |
    And these folders should be listed on the webUI
      | entry_name                 |
      | 'single'quotes.txt         |
      | block-aligned-plus-one.txt |
      | data.tar.gz                |
      | data.zip                   |
      | desktopapp.png             |
      | testimagelarge.svg         |

