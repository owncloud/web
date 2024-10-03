Feature: federation management

  Scenario: user create federated share
#    Given "Admin" logs in "LOCAL"
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following files into personal space using API
      | pathToFile   | content      |
      | example1.txt | example text |
    And "Alice" logs in
    And "Alice" opens the "open-cloud-mesh" app
    And "Alice" generates the federation share invitation token
    And "Alice" logs out
#    Given using server "REMOTE"
#    And "Admin" logs in
#    And "Admin" creates following user using API
#      | id    |
#      | Brian |
#    And "Brian" opens the "open-cloud-mesh" app
#    And "Brian" accept federation share invitation
#    And "Admin" logs in from REMOTE server
#    And "Admin" creates following user from REMOTE server using API
#      | id    |
#      | Brian |
#    And "Brian" opens the "open-cloud-mesh" app
#    And "Brian" accept federation share invitation
#    Then "Brian" should see the following federated connections:
#      | connections |


