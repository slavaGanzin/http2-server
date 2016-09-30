@library=needle

Feature: check server started
  Scenario: launch server
    Given spawn --ssl-port 4443 --http-port 8080
    Then request https://127.0.0.1:4443
    Then request http://127.0.0.1:8080
    And shutdown server
