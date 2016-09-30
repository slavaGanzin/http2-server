@library=needle

Feature: check response
  Scenario: get index.html
    Given spawn --ssl-port 4443 --http-port 8080
    Then request https://127.0.0.1:4443 200
    Then request http://127.0.0.1:8080 200
    And shutdown server
