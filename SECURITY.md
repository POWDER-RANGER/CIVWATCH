# Security Policy

## Supported Versions

We actively maintain security patches for the following versions:

- v0.1.x and later releases on the main branch
- All tagged releases from v0.1.0 forward

Versions prior to v0.1.0 are considered pre-release development builds and do not receive security updates. If you are using a pre-release version, please upgrade to the latest stable release.

## Threat Model and Scope

OBELISK operates in sensitive multi-agent environments where autonomous agents coordinate tasks, share encrypted state, and execute plans. We consider the following security concerns in scope for vulnerability reports:

**In Scope:**
- Vulnerabilities in the encrypted vault implementation that could lead to unauthorized cross-agent state access or data exfiltration
- Authentication or authorization bypass vulnerabilities in the role-based access control (RBAC) system
- Denial-of-service vulnerabilities in the agent orchestration layer that could prevent legitimate task execution
- PDDL planning engine exploits that could cause resource exhaustion, infinite loops, or execution of unintended actions
- Cryptographic weaknesses in inter-agent communication protocols or key derivation functions
- Injection vulnerabilities in task parameters or agent configuration
- Information disclosure through logging, error messages, or metrics endpoints

**Out of Scope:**
- Issues requiring physical access to the host system or privileged local access
- Denial-of-service attacks via legitimate resource-intensive planning tasks (rate limiting is the responsibility of system operators)
- Social engineering attacks against system operators or administrators
- Vulnerabilities in third-party dependencies (report these to the upstream project, though we appreciate being notified)
- Issues that require the attacker to already have admin-level RBAC permissions

## Reporting a Vulnerability

We use GitHub Security Advisories for coordinated vulnerability disclosure. This ensures that security issues are handled privately until patches are available.

### Reporting Process

**Option 1: GitHub Security Advisories (Recommended)**

1. Navigate to the Security tab of this repository at: https://github.com/POWDER-RANGER/OBLISK/security
2. Click "Report a vulnerability" 
3. Provide a detailed description including:
   - **Affected component**: Specify which subsystem is vulnerable (vault, orchestrator, planner, RBAC, etc.)
   - **Attack scenario**: Describe how an attacker could exploit this vulnerability
   - **Impact assessment**: Explain the potential consequences (data breach, DoS, privilege escalation, etc.)
   - **Proof-of-concept**: If available, include code, logs, curl commands, or step-by-step reproduction instructions
   - **Suggested remediation**: If you have ideas for fixing the issue, we welcome them
   - **Affected versions**: Specify which versions you've tested and confirmed vulnerable

**Option 2: Encrypted Email**

For researchers who prefer email contact or have concerns too sensitive for GitHub's platform, you can send GPG-encrypted reports to:

**Email**: security@[YOUR-DOMAIN-HERE]  
**GPG Key Fingerprint**: `ABCD 1234 EFGH 5678 IJKL 9012 MNOP 3456 QRST 7890`  
<!-- CUSTOMIZE: Replace with your actual GPG key fingerprint -->

Our public key is available at:
- Keybase: [https://keybase.io/YOURUSERNAME](https://keybase.io/YOURUSERNAME)
- OpenPGP Keyserver: [https://keys.openpgp.org](https://keys.openpgp.org)

<!-- CUSTOMIZE: Replace YOURUSERNAME with your actual Keybase username and ensure your key is published -->

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
4. **CVE Assignment**: For high or critical severity vulnerabilities, we request CVE identifiers through GitHub's CVE Numbering Authority partnership
5. **Patched Release**: We release a new version containing the security fix with clear upgrade instructions in the release notes
6. **Public Disclosure**: After the embargo period, we publicly disclose technical details to help the security community

**Embargo Period**: We request a 90-day embargo for critical vulnerabilities to allow time for patch development, testing, and deployment. This timeline is negotiable based on severity, active exploitation, and the complexity of remediation. For lower-severity issues, we may use shorter embargo periods.

**Researcher Recognition**: We believe in recognizing the valuable work of security researchers. We will credit you in:
- The security advisory
- Release notes for the patched version
- Our security acknowledgments page (if you wish to be listed)

Credit will use the name and affiliation you provide, or we can keep your report anonymous if you prefer.

## Security Best Practices for Deployers

If you are deploying OBELISK in a production environment, we recommend the following security hardening measures:

**Network Security:**
- Deploy OBELISK behind a firewall with strict ingress/egress rules
- Use TLS for all inter-agent communication (configure with your own certificates)
- Implement rate limiting on the orchestrator API to prevent DoS attacks
- Monitor metrics endpoints for unusual patterns (sudden spikes in failed authentication, vault access denials, etc.)

**Access Control:**
- Follow the principle of least privilege when assigning RBAC roles
- Rotate agent secrets regularly (we recommend every 30 days for production deployments)
- Use strong, randomly generated secrets for vault master keys
- Enable audit logging to track all administrative actions

**Cryptographic Hygiene:**
- Ensure your vault master secret has at least 256 bits of entropy
- Use hardware security modules (HSMs) or key management services (KMS) for production vault keys when possible
- Regularly review and update cryptographic algorithms as new recommendations emerge

**Monitoring and Incident Response:**
- Set up alerts for authentication failures, authorization denials, and abnormal vault access patterns
- Maintain backups of vault data with encryption at rest
- Have an incident response plan that includes procedures for agent compromise scenarios

## Artifact Verification

All releases of OBELISK are cryptographically signed to ensure integrity and authenticity. This prevents attackers from distributing modified versions of our software.

### Verifying Release Signatures

Every release includes a detached GPG signature file with a `.sig` or `.asc` extension. To verify a release:

**Step 1: Download the release archive and signature**

```bash
# Download both the release archive and its signature
wget https://github.com/POWDER-RANGER/OBLISK/releases/download/v0.1.0/obelisk-v0.1.0.tar.gz
wget https://github.com/POWDER-RANGER/OBLISK/releases/download/v0.1.0/obelisk-v0.1.0.tar.gz.sig
```

**Step 2: Import our signing key** (first time only)

```bash
# Import from Keybase (recommended)
curl https://keybase.io/YOURUSERNAME/pgp_keys.asc | gpg --import

# OR import from OpenPGP keyserver
gpg --keyserver keys.openpgp.org --recv-keys ABCD1234EFGH5678IJKL9012MNOP3456QRST7890
```

<!-- CUSTOMIZE: Replace YOURUSERNAME and the key ID with your actual values -->

**Step 3: Verify the signature**

```bash
gpg --verify obelisk-v0.1.0.tar.gz.sig obelisk-v0.1.0.tar.gz
```

**Expected Output:**

```
gpg: Signature made Fri 04 Oct 2025 02:15:33 PM CDT
gpg:                using RSA key ABCD1234EFGH5678IJKL9012MNOP3456QRST7890
gpg: Good signature from "Curtis (POWDER-RANGER) <your-email@domain.com>" [ultimate]
Primary key fingerprint: ABCD 1234 EFGH 5678 IJKL 9012 MNOP 3456 QRST 7890
```

Look for "Good signature" in the output. If you see "BAD signature" or any warnings about the signature not being valid, do not trust the release archive.

**Key Fingerprint Verification**: When importing our key for the first time, verify the fingerprint matches what is published here:

```
Primary Key Fingerprint: ABCD 1234 EFGH 5678 IJKL 9012 MNOP 3456 QRST 7890
```

<!-- CUSTOMIZE: Replace with your actual 40-character GPG fingerprint, formatted with spaces every 4 characters -->

You can also verify this fingerprint is correct by checking:
- Our Keybase profile: [https://keybase.io/YOURUSERNAME](https://keybase.io/YOURUSERNAME)
- The repository's README.md file
- Our official website: [https://your-domain.com/security](https://your-domain.com/security)

**Important Security Note**: Releases without valid signatures should not be trusted and may have been tampered with by attackers. Always verify signatures before deploying OBELISK in any environment.

## Security Acknowledgments

We would like to thank the following security researchers who have responsibly disclosed vulnerabilities and helped improve OBELISK's security:

<!-- This section will be populated as researchers report and we remediate vulnerabilities -->

- *No vulnerabilities reported yet*

If you have reported a vulnerability and would like to be listed here, please let us know your preferred name and affiliation (or choose to remain anonymous).

## Questions or Concerns

If you have questions about this security policy, our security practices, or need clarification on the reporting process, please contact:

- **Public inquiries**: Open an issue in this repository with the `security` label
- **Private security concerns**: Use the reporting channels described above

We take security seriously and appreciate the security research community's efforts to keep open source software safe.
