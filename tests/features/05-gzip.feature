@library=needle

Feature: gzip
  Scenario: enabled
    Given spawn . --gzip
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has Accept-Encoding
    And shutdown server
    
  Scenario: disabled
    Given spawn . --no-gzip
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has _EMPTY_
    And shutdown server
    
  Scenario: shutdown
    And shutdown server
