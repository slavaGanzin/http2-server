@library=needle

Feature: check response
  Scenario: start server
    Given ./http2-server --ssl-port 4443 --http-port 8080

  Scenario: check index.html
    Then GET https://127.0.0.1:4443 200
    Then response body has <h1>Hello HTTP2</h1>

  Scenario: check script.js
    Then GET https://127.0.0.1:4443/script.js 200
    Then response body has console.log\(\'hello http2\'\)

  Scenario: check main.css
    Then GET https://127.0.0.1:4443/main.css 200
    Then response body has h1 { color: white }\nbody { background: #262422 }

  Scenario: check http redirect
    Then GET http://127.0.0.1:8080 301
    Then response body has <META http-equiv="refresh" content="0;URL='https://127.0.0.1:4443/'">

  Scenario: check script.js with http
    Given shutdown server
    Then ./http2-server --ssl-port 4443 --http-port 8080 --no-ssl
    Then GET http://127.0.0.1:8080/script.js 200
    Then response body has console.log\(\'hello http2\'\)

  Scenario: shutdown
    Given shutdown server
