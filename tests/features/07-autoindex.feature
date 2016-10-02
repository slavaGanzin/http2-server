@library=needle

Feature: autoindex
  Background:
    Then shutdown server
    
  Scenario: enabled with wrong index
    Given spawn --index wrong.html
    Then GET https://127.0.0.1:4443 200
    Then response body has <title>listing directory /</title>
    
  Scenario: disabled with wrong index
    Given spawn --index wrong.html --no-autoindex
    Then GET https://127.0.0.1:4443 404
    
  Scenario: shutdown
    And shutdown server
