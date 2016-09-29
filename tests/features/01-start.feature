@library=needle

Feature: check server started
  Scenario: generate certs
    Given generate certs

  Scenario: launch server
    Given launch server -p 4443
    Then request https://127.0.0.1:4443
    And shutdown server
