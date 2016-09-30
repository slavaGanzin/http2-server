@library=needle

Feature: CORS
  Scenario: enabled
    Given spawn --cors
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has ^\*$
    And shutdown server
    
  Scenario: disabled
    Given spawn --no-cors
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has _EMPTY_
    And shutdown server
    
  Scenario: shutdown
    And shutdown server
