@library=needle

Feature: check server started
  Background:
    Then shutdown server

  Scenario: launch http2 server
    Given ./http2-server --ssl-port 4443 --http-port 8080
    Then GET http://127.0.0.1:8080 301
    Then GET https://127.0.0.1:4443/index.html 200

  Scenario: launch http server
    Given ./http2-server --ssl-port 4444 --http-port 8081 --no-ssl
    Then GET https://127.0.0.1:4443 ECONNREFUSED
    Then GET https://127.0.0.1:4444 ECONNREFUSED
    Then GET http://127.0.0.1:8080 ECONNREFUSED
    Then GET http://127.0.0.1:8081 200

  Scenario: shutdown
    Then shutdown server
