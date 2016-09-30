@library=needle

Feature: TLS certificates
  Scenario: remove old
    Given remove certificates if exists
    
  Scenario: generate
    Given exec --generate-cert
