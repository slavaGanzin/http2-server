@library=needle

Feature: CORS
  Background:
    Then shutdown server

  Scenario: enabled
    Given ./http2-server --cors
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has ^\*$
    
  Scenario: disabled
    Given ./http2-server --no-cors
    Then GET https://127.0.0.1:4443/index.html 200
    Then response headers.access-control-allow-origin has _EMPTY_
    
  Scenario: shutdown
    And shutdown server
