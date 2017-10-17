@library=needle

Feature: proxy
  Background:
    Then shutdown server

  Scenario: no proxy
    Then shutdown server
    Given ./http2-server --ssl-port 4443
    Then GET https://127.0.0.1:4443/index.html 200
    Then GET https://127.0.0.1:4443/doodles 404
    
  Scenario: proxy to google
    Given ./http2-server --ssl-port 4443 --proxy https://www.google.com/ -P
    Then GET https://127.0.0.1:4443/index.html 200
    Then GET https://127.0.0.1:4443/doodles 200
    
  Scenario: shutdown
    And shutdown server
    
