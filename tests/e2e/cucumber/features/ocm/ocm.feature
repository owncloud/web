@ocm
Feature: federation management
  As a user
  I want to establish connection between multiple oCIS instance
  So that I share resource

  Scenario: user creates a federated share
    Given using "LOCAL" server
    And "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following files into personal space using API
      | pathToFile   | content      |
      | example1.txt | example text |
    And "Alice" logs in
    And "Alice" logs out
    Given using "FEDERATED" server
    And "Admin" creates following user using API
      | id    |
      | Brian |
    And "Brian" logs in
    And "Brian" logs out
