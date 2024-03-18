Feature: general management

  Scenario: logo can be changed in the admin settings
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the general management page
    Then "Admin" should be able to upload a logo from the local file "filesForUpload/testavatar.png"
    And "Admin" navigates to the general management page
    And "Admin" should be able to reset the logo
    And "Admin" logs out

