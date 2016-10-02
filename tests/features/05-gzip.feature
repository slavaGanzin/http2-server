@library=needle

Feature: gzip
  Background:
    Then shutdown server

  Scenario: enabled
    Given spawn . --gzip
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has Accept-Encoding
    
  Scenario: disabled
    Given spawn . --no-gzip
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has _EMPTY_
    
  Scenario: shutdown
    And shutdown server
