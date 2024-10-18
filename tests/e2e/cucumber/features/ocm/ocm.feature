@ocm
Feature: federation management

  Scenario: user create federated share
    Given using "LOCAL" server
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following files into personal space using API
      | pathToFile   | content      |
      | example1.txt | example text |
    And "Alice" logs in
    And "Alice" logs out
    Given using "FEDERATED" server
    And "Admin" logs in
    And "Admin" creates following user using API
      | id    |
      | Brian |
