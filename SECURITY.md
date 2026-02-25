# Security Policy

## Supported Versions

We actively maintain security patches for the following versions:

- v0.1.x and later releases on the main branch
- All tagged releases from v0.1.0 forward

Versions prior to v0.1.0 are considered pre-release development builds and do not receive security updates. If you are using a pre-release version, please upgrade to the latest stable release.

## Threat Model and Scope

CIVWATCH is a civic transparency and anomaly detection platform designed to ingest, process, and analyze public civic data. We consider the following security concerns in scope for vulnerability reports:

**In Scope:**
- Vulnerabilities in the data ingestion pipeline that could allow injection of malicious data
- Authentication or authorization bypass vulnerabilities in the API layer
- Denial-of-service vulnerabilities that could prevent legitimate data analysis
- Vulnerabilities in the ML/anomaly detection that could cause erroneous results
- Cryptographic weaknesses in data transmission or storage
- Information disclosure through logging, error messages, or metrics endpoints
- Database vulnerabilities (SQL injection, unauthorized access)
- Privacy violations or unauthorized data exposure

**Out of Scope:**
- Issues requiring physical access to the host system or privileged local access
- Denial-of-service attacks via resource-intensive queries (rate limiting is the responsibility of system operators)
- Social engineering attacks against system operators or administrators
- Vulnerabilities in third-party dependencies (report these to the upstream project, though we appreciate being notified)
- Issues that require the attacker to already have admin-level API access

## Reporting a Vulnerability

We use GitHub Security Advisories for coordinated vulnerability disclosure. This ensures that security issues are handled privately until patches are available.

### Reporting Process

**Option 1: GitHub Security Advisories (Recommended)**

1. Navigate to the Security tab of this repository at: https://github.com/POWDER-RANGER/CIVWATCH/security
2. Click "Report a vulnerability" 
3. Provide a detailed description including:
   - **Affected component**: Specify which subsystem is vulnerable (ingestion, API, ML, database, etc.)
   - **Attack scenario**: Describe how an attacker could exploit this vulnerability
   - **Impact assessment**: Explain the potential consequences (data breach, DoS, privilege escalation, etc.)
   - **Proof-of-concept**: If available, include code, logs, curl commands, or step-by-step reproduction instructions
   - **Suggested remediation**: If you have ideas for fixing the issue, we welcome them
   - **Affected versions**: Specify which versions you've tested and confirmed vulnerable

**Option 2: Email**

For researchers who prefer email contact, you can send reports to:

**Email**: security@civwatch.io (or contact information TBD)  

### What to Expect

We are committed to responsive and transparent security practices:

**Response Timeline:**
- **Initial acknowledgment**: Within 24 hours of receiving your report
- **Triage and severity assessment**: Within 72 hours, including our preliminary analysis and classification
- **Patch development timeline**: Provided within 72 hours for confirmed vulnerabilities
- **Status updates**: We will provide updates at least weekly during the remediation process

**Severity Classification**: We use CVSS 3.1 scoring to assess vulnerability severity and prioritize remediation efforts.

## Disclosure Coordination

For confirmed vulnerabilities, we follow a coordinated disclosure process that balances security with transparency:

1. **Patch Development**: We develop and thoroughly test patches in a private security branch
2. **Downstream Notification**: If applicable, we notify known downstream users or dependent projects before public disclosure
3. **Security Advisory Publication**: We publish a GitHub Security Advisory with severity assessment, affected versions, and remediation guidance
4. **CVE Assignment**: For high or critical severity vulnerabilities, we request CVE identifiers
5. **Patched Release**: We release a new version containing the security fix with clear upgrade instructions in the release notes
6. **Public Disclosure**: After the embargo period, we publicly disclose technical details to help the security community

**Embargo Period**: We request a 90-day embargo for critical vulnerabilities to allow time for patch development, testing, and deployment. This timeline is negotiable based on severity, active exploitation, and the complexity of remediation. For lower-severity issues, we may use shorter embargo periods.

**Researcher Recognition**: We believe in recognizing the valuable work of security researchers. We will credit you in:
- The security advisory
- Release notes for the patched version
- Our security acknowledgments page (if you wish to be listed)

Credit will use the name and affiliation you provide, or we can keep your report anonymous if you prefer.

## Security Best Practices for Deployers

If you are deploying CIVWATCH in a production environment, we recommend the following security hardening measures:

**Network Security:**
- Deploy CIVWATCH behind a firewall with strict ingress/egress rules
- Use TLS for all data transmission (configure with your own certificates)
- Implement rate limiting on the API to prevent DoS attacks
- Monitor logs and metrics endpoints for unusual patterns (sudden spikes in failed authentication, query errors, etc.)

**Access Control:**
- Follow the principle of least privilege when assigning API roles
- Rotate API secrets regularly (we recommend every 30 days for production deployments)
- Use strong, randomly generated secrets for database credentials and encryption keys
- Enable audit logging to track all administrative actions

**Data Security:**
- Encrypt sensitive data at rest in PostgreSQL
- Use Redis authentication and encryption for cache data
- Implement proper database backup and recovery procedures
- Regularly review access logs for unauthorized access attempts

**Cryptographic Hygiene:**
- Ensure your encryption keys have at least 256 bits of entropy
- Use hardware security modules (HSMs) or key management services (KMS) for production keys when possible
- Regularly review and update cryptographic algorithms as new recommendations emerge

**Monitoring and Incident Response:**
- Set up alerts for authentication failures, authorization denials, and abnormal data access patterns
- Maintain backups of data with encryption at rest
- Have an incident response plan that includes procedures for compromise scenarios
- Regularly test your disaster recovery procedures

## Security Acknowledgments

We would like to thank the following security researchers who have responsibly disclosed vulnerabilities and helped improve CIVWATCH's security:

<!-- This section will be populated as researchers report and we remediate vulnerabilities -->

- *No vulnerabilities reported yet*

If you have reported a vulnerability and would like to be listed here, please let us know your preferred name and affiliation (or choose to remain anonymous).

## Questions or Concerns

If you have questions about this security policy, our security practices, or need clarification on the reporting process, please contact:

- **Public inquiries**: Open an issue in this repository with the `security` label
- **Private security concerns**: Use the reporting channels described above

We take security seriously and appreciate the security research community's efforts to keep open source software safe.
