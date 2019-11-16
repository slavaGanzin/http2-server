@library=needle

Feature: proxy
  Background:
    Then shutdown server

  Scenario: no 404
    Given ./http2-server --ssl-port 4443
    Then GET https://127.0.0.1:4443/thereisnospoon 404
    Then response body has Cannot GET /thereisnospoon

  Scenario: proxy to google
    Given ./http2-server --ssl-port 4443 --404 tests/public/404.html
    Then GET https://127.0.0.1:4443/thereisnospoon 404
    Then response body has Custom 404

  Scenario: shutdown
    And shutdown server
