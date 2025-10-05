# SECURITY.md

**Document Version:** 1.0.0  
**Last Updated:** October 4, 2025  
**Classification:** Public  
**Authority:** CIVWATCH Security Team  

---

## 1. Supported Versions

The following table outlines the CIVWATCH versions currently receiving security updates:

| Version | Support Status | End-of-Life Date |
|---------|----------------|------------------|
| main    | ✅ Supported   | Rolling          |
| develop | ✅ Supported   | Rolling          |
| < 1.0   | ❌ Unsupported | N/A              |

**Note:** Pre-1.0 releases are in active development. Security patches apply to `main` and `develop` branches. Post-1.0, semantic versioning will govern support timelines.

---

## 2. Threat Model and Scope

### 2.1 In-Scope Assets

The following components are covered by this security policy:

- **Web Application**: Frontend (React/TypeScript), Backend (Node.js/Express), ML Service (Python/FastAPI)
- **API Endpoints**: All `/api/*` routes exposed by the backend service
- **Authentication System**: JWT-based authentication, OAuth 2.0 integrations
- **Data Storage**: PostgreSQL database, Redis cache, encrypted backups
- **Infrastructure**: Docker containers, CI/CD pipelines, GitHub Actions workflows
- **Dependencies**: Third-party libraries listed in `package.json`, `requirements.txt`

### 2.2 Out-of-Scope

- Denial-of-service (DoS/DDoS) attacks on public-facing infrastructure
- Social engineering attacks targeting CIVWATCH personnel
- Physical security of development or deployment environments
- Third-party services (e.g., GitHub, npm registry, PyPI) outside CIVWATCH control

### 2.3 Threat Categories

We prioritize the following threat classes per NASA NPR 7150.2:

1. **Critical**: Remote code execution, authentication bypass, data exfiltration
2. **High**: Privilege escalation, SQL injection, cross-site scripting (XSS)
3. **Medium**: Information disclosure, cross-site request forgery (CSRF)
4. **Low**: Denial of service (application-level), insecure configurations

---

## 3. Reporting a Vulnerability

### 3.1 Secure Disclosure Channels

To report a security vulnerability, use **one** of the following methods:

#### Option A: Encrypted Email (Preferred)
- **Email Address**: `security@civwatch.example` (placeholder - to be updated)
- **GPG Public Key**: See Section 6 (Artifact Verification)
- **Expected Response Time**: 24 hours (acknowledgment)

#### Option B: GitHub Security Advisories
- Navigate to: [https://github.com/POWDER-RANGER/CIVWATCH/security/advisories](https://github.com/POWDER-RANGER/CIVWATCH/security/advisories)
- Click "Report a vulnerability" (requires GitHub account)
- Expected Response Time: 24 hours (acknowledgment)

**⚠️ Do NOT report security vulnerabilities via:**
- Public GitHub Issues
- Pull Requests
- Discussions or community forums
- Social media platforms

### 3.2 Required Information

To expedite triage and remediation, include:

1. **Vulnerability Description**: Clear summary of the issue
2. **Affected Components**: Specific services, endpoints, or modules
3. **Reproduction Steps**: Detailed, repeatable proof-of-concept
4. **Impact Assessment**: Potential consequences (data breach, privilege escalation, etc.)
5. **Suggested Remediation**: Optional—if you have mitigation recommendations
6. **CVE/CWE Mapping**: If applicable (e.g., CWE-89 for SQL Injection)
7. **Proof-of-Concept**: Code snippets, screenshots, or logs (sanitize sensitive data)

### 3.3 Report Template

```markdown
**Vulnerability Title:**  
**Severity (Self-Assessment):** [Critical/High/Medium/Low]  
**Affected Versions:**  
**Component/Service:**  

**Description:**  
[Detailed explanation of the vulnerability]

**Steps to Reproduce:**  
1. [Step 1]
2. [Step 2]
...

**Expected Behavior:**  
[What should happen]

**Actual Behavior:**  
[What actually happens]

**Impact:**  
[Potential consequences]

**Remediation Suggestion:**  
[Optional: Your recommended fix]

**References:**  
- CVE/CWE: [If applicable]
- Related Issues: [Links to similar reports]
```

---

## 4. Service Level Agreement (SLA)

### 4.1 Response Timeline

| Phase                | Timeline          | Description                                              |
|----------------------|-------------------|----------------------------------------------------------|
| **Acknowledgment**   | 24 hours          | Confirmation of receipt and case ID assignment           |
| **Initial Triage**   | 72 hours          | Severity classification and validation                   |
| **Patch Development**| 7-30 days         | Based on severity (see 4.2)                              |
| **Public Disclosure**| 90 days (default) | Coordinated release (see Section 5)                      |

### 4.2 Severity-Based Patch Schedule

| Severity  | Target Patch Time | Public Disclosure Delay |
|-----------|-------------------|-------------------------|
| Critical  | 7 days            | 30 days                 |
| High      | 14 days           | 60 days                 |
| Medium    | 30 days           | 90 days                 |
| Low       | Best effort       | 120 days                |

**Exception Handling:**  
If a patch cannot be delivered within the target window, we will:
1. Notify the reporter within the initial timeline
2. Provide a revised delivery estimate
3. Offer mitigation guidance or workarounds (if available)

### 4.3 Communication Cadence

- **Weekly Updates**: For Critical/High severity issues
- **Bi-weekly Updates**: For Medium severity issues
- **Monthly Updates**: For Low severity issues

---

## 5. Disclosure Coordination

### 5.1 Coordinated Vulnerability Disclosure (CVD)

CIVWATCH follows the ISO/IEC 29147:2018 standard for vulnerability disclosure:

1. **Private Disclosure Period**: Reporter and CIVWATCH team coordinate privately
2. **Embargo Period**: Default 90 days from acknowledgment (adjustable by mutual agreement)
3. **Public Disclosure**: Simultaneous release of:
   - Security advisory (GitHub Security Advisories)
   - Patched release (tagged commit)
   - CVE assignment (if applicable)
   - Credit attribution (if authorized by reporter)

### 5.2 Early Disclosure Criteria

We may accelerate public disclosure if:
- The vulnerability is actively exploited in the wild
- Proof-of-concept code becomes publicly available
- Multiple independent researchers discover the same issue

### 5.3 Researcher Recognition

With permission, we will credit security researchers via:
- **GitHub Security Advisories**: Named attribution
- **CHANGELOG.md**: Recognition in release notes
- **Security Hall of Fame**: Dedicated acknowledgment page (coming soon)

**Opt-Out**: Researchers may request anonymous attribution at any time.

---

## 6. Artifact Verification

### 6.1 GPG Signature for Secure Communications

**Placeholder Notice**: GPG keys will be published upon production deployment. During the current development phase (pre-1.0), use the email contact in Section 3.1.

**Future Implementation**:
```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[GPG PUBLIC KEY PLACEHOLDER]
-----END PGP PUBLIC KEY BLOCK-----

Fingerprint: [XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX]
Key ID: [Placeholder]
Expiration: [Placeholder]
```

**Verification Steps** (post-deployment):
1. Download the public key from this document or from a keyserver:
   ```bash
   gpg --keyserver keyserver.ubuntu.com --recv-keys [KEY_ID]
   ```
2. Verify the fingerprint matches the one published above
3. Encrypt your vulnerability report:
   ```bash
   gpg --encrypt --armor --recipient security@civwatch.example report.txt
   ```
4. Send the encrypted file to `security@civwatch.example`

### 6.2 Release Artifact Signing

**Future Implementation**: All production releases will be GPG-signed:
- **Git Tags**: Signed with maintainer GPG keys
- **Docker Images**: Cosign signatures for container images
- **npm Packages**: Provenance attestations via npm signatures

**Verification Example** (post-1.0):
```bash
# Verify Git tag signature
git verify-tag v1.0.0

# Verify Docker image with Cosign
cosign verify ghcr.io/powder-ranger/civwatch:latest
```

### 6.3 Key Rotation Policy

- **Rotation Schedule**: Every 2 years or upon compromise
- **Notification**: 30 days advance notice via GitHub Discussions
- **Overlap Period**: Old and new keys valid for 90 days during rotation

---

## 7. Security Measures

### 7.1 Current Implementation Status

⚠️ **Development Notice**: CIVWATCH is in early development (pre-1.0). The measures below represent our target architecture. Implementation status is tracked in [Issue #6](https://github.com/POWDER-RANGER/CIVWATCH/issues/6).

### 7.2 Defense-in-Depth Architecture

#### Encryption
- **Data in Transit**: TLS 1.3 for all HTTPS connections, HSTS enabled
- **Data at Rest**: PostgreSQL encryption, AES-256 for backups
- **Secrets Management**: Environment-based secrets (not in repository)

#### Authentication & Authorization
- **Password Storage**: bcrypt (cost factor 12)
- **Session Management**: JWT tokens (1-hour expiry), refresh tokens (7-day TTL)
- **OAuth 2.0**: Third-party authentication (Google, GitHub)
- **MFA**: Multi-factor authentication support (planned)

#### API Security
- **Rate Limiting**: 100 requests/minute per IP (adjustable)
- **Input Validation**: Parameterized queries, ORM-based database access
- **CORS Policies**: Strict origin whitelisting
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

#### Infrastructure
- **Container Isolation**: Docker with minimal privileges (non-root user)
- **Network Segmentation**: Internal service communication on isolated Docker networks
- **Dependency Scanning**: GitHub Dependabot, npm audit, safety (Python)
- **CI/CD Security**: GitHub Actions with OIDC authentication

---

## 8. Legal and Compliance

### 8.1 Responsible Research Safe Harbor

CIVWATCH commits to not pursuing legal action against security researchers who:
- Act in good faith and follow this policy
- Do not intentionally harm users or systems
- Do not exfiltrate, modify, or destroy data
- Do not publicly disclose vulnerabilities before coordinated release

### 8.2 License and Usage

This software is provided under the MIT License for **legitimate civic transparency purposes only**. Prohibited uses include:
- Unauthorized access to systems or data
- Harassment, stalking, or privacy violations
- Any illegal activities contrary to local, state, or federal law

### 8.3 Bug Bounty Program

**Status**: Not currently active. A bug bounty program will be announced once CIVWATCH reaches production (v1.0+).

---

## 9. Additional Resources

- **Contributing Guidelines**: [CONTRIBUTING.md](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CODE_OF_CONDUCT.md)
- **License**: [LICENSE](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/LICENSE)
- **Architecture Documentation**: [docs/architecture.md](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/docs/architecture.md)

---

## 10. Policy Updates

This security policy is a living document. Changes will be:
- Committed to the `main` branch with version increments
- Announced via GitHub Discussions
- Logged in [CHANGELOG.md](https://github.com/POWDER-RANGER/CIVWATCH/blob/main/CHANGELOG.md)

**Notification Channels**:
- GitHub Watch/Notifications
- Repository README
- Security advisories

---

## Appendix A: Standards and Frameworks

This policy aligns with:
- **NASA NPR 7150.2**: Software Engineering Requirements
- **ISO/IEC 29147:2018**: Vulnerability Disclosure
- **NIST SP 800-53**: Security and Privacy Controls
- **OWASP Top 10**: Web Application Security Risks
- **CWE Top 25**: Most Dangerous Software Weaknesses

---

**End of Document**

*For questions or clarifications regarding this security policy, contact: security@civwatch.example (placeholder)*
