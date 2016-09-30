@library=needle

Feature: check cors
  Scenario: launch http2 server cors
    Given spawn --cors
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has ^\*$
    And shutdown server
    
  Scenario: launch http2 server without cors
    Given spawn -s
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has _EMPTY_
    And shutdown server
    
  Scenario: shutdown
    And shutdown server
