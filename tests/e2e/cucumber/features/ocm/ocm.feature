Feature: federation management

  Scenario: user create federated share
    Given using "LOCAL" server
    And "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following files into personal space using API
      | pathToFile   | content      |
      | example1.txt | example text |
    And "Alice" logs in
    And "Alice" opens the "open-cloud-mesh" app
    And "Alice" generates the federation share invitation token
    And "Alice" logs out
    Given using "FEDERATED" server
    And "Admin" logs in
    And "Admin" creates following user using API
      | id    |
      | Brian |
    And "Brian" logs in
    And "Brian" opens the "open-cloud-mesh" app
    When "Brian" accepts federated share invitation by "Alice"
#    Then "Brian" should see the following federated connections:
#      | user  | email             | institution |
#      | Alice | alice@example.org | ocis:9200   |
#    And "Alice" shares the following resource using the sidebar panel
#      | resource | recipient | type | role     | resourceType | userType |
#      | test.odt | Brian     | user | Can view | file         | external |
    And "Brian" logs out

