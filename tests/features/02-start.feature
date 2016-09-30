@library=needle

Feature: check server started
  Scenario: launch http2 server
    Given spawn --ssl-port 4443 --http-port 8080
    Then request https://127.0.0.1:4443/index.html 200
    Then request http://127.0.0.1:8080 200
    And shutdown server
    
  Scenario: launch http server
    Given spawn --ssl-port 4444 --http-port 8081 --no-ssl
    Then request https://127.0.0.1:4443 ECONNREFUSED
    Then request https://127.0.0.1:4444 ECONNREFUSED
    Then request http://127.0.0.1:8080 ECONNREFUSED
    Then request http://127.0.0.1:8081 200
    And shutdown server
    
  Scenario: finally shutdown
    Then shutdown server
  
