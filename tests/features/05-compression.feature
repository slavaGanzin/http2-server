@library=needle

Feature: compression
  Background:
    Then shutdown server

  Scenario: enabled
    Given ./http2-server . --compression
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has Accept-Encoding
    
  Scenario: disabled
    Given ./http2-server . 
    Then GET https://127.0.0.1:4443 200
    Then response headers.vary has _EMPTY_
    
  Scenario: shutdown
    And shutdown server
