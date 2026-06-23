# CIVWATCH Warrant Canary

> **Status**: OPERATIONAL | **Update Frequency**: Monthly | **Last Updated**: 2026-06-24
> **GPG Key**: [CIVWATCH Official Signing Key](https://civwatch.io/keys/civwatch-signing-key.asc)
> **Verification**: All canaries are cryptographically signed and published at `/canary.txt`

---

## 1. PURPOSE

A warrant canary is a mechanism to inform users of secret government requests without violating gag orders. By regularly publishing a signed statement that certain requests have **not** been received, CIVWATCH can implicitly notify users if such a statement stops appearing.

> **Legal Basis**: Warrant canaries are generally considered protected speech under the First Amendment. See [EFF Warrant Canary FAQ](https://www.eff.org/deeplinks/2014/04/warrant-canary-faq).

---

## 2. CURRENT CANARY

```
═══════════════════════════════════════════════════════════════════
                    CIVWATCH WARRANT CANARY
                      June 2026 Edition
═══════════════════════════════════════════════════════════════════

Canary ID        : CIVW-CANARY-2026-006
Valid From       : 2026-06-24T00:00:00Z
Valid Until      : 2026-07-24T00:00:00Z
Published By     : CIVWATCH Executive Director
GPG Key          : 0xCIVWATCH2026
Fingerprint      : [REDACTED — see civwatch.io/keys]

═══════════════════════════════════════════════════════════════════
DECLARATIONS
═══════════════════════════════════════════════════════════════════

As of the publication date above, CIVWATCH declares that:

[✓] No national security letters have been received.
[✓] No FISA court orders have been received.
[✓] No gag orders of any kind have been received.
[✓] No government entity has requested installation of surveillance 
    equipment or software on CIVWATCH systems.
[✓] No government entity has requested access to encryption keys, 
    backdoors, or decryption assistance.
[✓] No government entity has requested bulk user data or metadata.
[✓] No government entity has compelled CIVWATCH to modify, remove, 
    or falsify any data or analysis.
[✓] No government entity has requested delay or suppression of 
    any publication.
[✓] No CIVWATCH staff have been questioned by law enforcement 
    regarding platform operations.
[✓] No equipment seizure or search has occurred.

═══════════════════════════════════════════════════════════════════
VERIFICATION
═══════════════════════════════════════════════════════════════════

This canary is signed with CIVWATCH's official GPG key.
Verify with: gpg --verify canary.txt

If this canary is not updated by 2026-07-25, users should assume
that CIVWATCH has received a secret government request and should
exercise appropriate caution.

If any declaration above is marked with [✗] instead of [✓], the
corresponding event has occurred. See the notes section for details.

═══════════════════════════════════════════════════════════════════
NOTES
═══════════════════════════════════════════════════════════════════

None.

═══════════════════════════════════════════════════════════════════
SIGNATURE
═══════════════════════════════════════════════════════════════════

[PGP SIGNATURE BLOCK]
-----BEGIN PGP SIGNATURE-----

[Signed with CIVWATCH Official Signing Key]

-----END PGP SIGNATURE-----
═══════════════════════════════════════════════════════════════════
```

---

## 3. CANARY ARCHIVE

| Canary ID | Valid From | Valid Until | Status | Link |
|-----------|-----------|-------------|--------|------|
| CIVW-CANARY-2026-006 | 2026-06-24 | 2026-07-24 | **CURRENT** | [View](https://civwatch.io/canary/2026-006) |
| CIVW-CANARY-2026-005 | 2026-05-24 | 2026-06-24 | ✅ Verified | [View](https://civwatch.io/canary/2026-005) |
| CIVW-CANARY-2026-004 | 2026-04-24 | 2026-05-24 | ✅ Verified | [View](https://civwatch.io/canary/2026-004) |
| CIVW-CANARY-2026-003 | 2026-03-24 | 2026-04-24 | ✅ Verified | [View](https://civwatch.io/canary/2026-003) |
| CIVW-CANARY-2026-002 | 2026-02-24 | 2026-03-24 | ✅ Verified | [View](https://civwatch.io/canary/2026-002) |
| CIVW-CANARY-2026-001 | 2026-01-24 | 2026-02-24 | ✅ Verified | [View](https://civwatch.io/canary/2026-001) |

---

## 4. VERIFICATION PROCEDURES

### 4.1 Automatic Verification

```bash
# Download and verify the current canary
curl -s https://civwatch.io/canary.txt | gpg --verify

# Expected output:
# gpg: Good signature from "CIVWATCH Executive Director <ed@civwatch.io>"
# gpg:                 aka "CIVWATCH Official Signing Key"
```

### 4.2 Programmatic Monitoring

```python
#!/usr/bin/env python3
"""
CIVWATCH Canary Monitor
Run via cron daily to detect missing or invalid canary updates.
"""

import urllib.request
import subprocess
import datetime
import sys

CANARY_URL = "https://civwatch.io/canary.txt"
GPG_KEY_URL = "https://civwatch.io/keys/civwatch-signing-key.asc"
MAX_AGE_DAYS = 35  # Canary should be updated monthly

def fetch_canary():
    """Fetch current canary from CIVWATCH."""
    try:
        with urllib.request.urlopen(CANARY_URL, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"CRITICAL: Cannot fetch canary: {e}")
        sys.exit(2)  # Nagios CRITICAL

def verify_signature(canary_data):
    """Verify GPG signature on canary."""
    try:
        result = subprocess.run(
            ["gpg", "--verify", "-"],
            input=canary_data,
            capture_output=True,
            timeout=30
        )
        if result.returncode == 0:
            return True, "Valid signature"
        return False, f"Invalid signature: {result.stderr.decode()}"
    except Exception as e:
        return False, f"Verification failed: {e}"

def check_freshness(canary_text):
    """Check if canary is within expected freshness window."""
    for line in canary_text.decode().split('\n'):
        if 'Valid Until' in line:
            date_str = line.split(':')[1].strip()
            valid_until = datetime.datetime.strptime(
                date_str, '%Y-%m-%dT%H:%M:%SZ'
            )
            age = (datetime.datetime.utcnow() - valid_until).days
            if age > MAX_AGE_DAYS:
                return False, f"Canary expired {age} days ago"
            return True, f"Canary valid, expires in {age} days"
    return False, "Cannot parse canary date"

def main():
    canary_data = fetch_canary()
    sig_valid, sig_msg = verify_signature(canary_data)
    fresh, fresh_msg = check_freshness(canary_data)
    
    if not sig_valid:
        print(f"CRITICAL: {sig_msg}")
        sys.exit(2)
    
    if not fresh:
        print(f"WARNING: {fresh_msg}")
        sys.exit(1)  # Nagios WARNING
    
    # Check for [✗] markers
    if b'[✗]' in canary_data:
        print("CRITICAL: Canary indicates government request received!")
        sys.exit(2)
    
    print(f"OK: {sig_msg}. {fresh_msg}")
    sys.exit(0)

if __name__ == "__main__":
    main()
```

---

## 5. CANARY COMPROMISE PROTOCOL

If CIVWATCH receives a secret government request that cannot be disclosed:

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Do not publish the next scheduled canary | At next scheduled update |
| 2 | Publish a "canary maintenance" notice if gag allows | Within 48 hours |
| 3 | Notify EFF legal team through pre-arranged channel | Within 24 hours |
| 4 | Continue operations within legal constraints | Ongoing |
| 5 | After gag expires: publish full disclosure | Immediately |

---

## 6. GPG KEY MANAGEMENT

### 6.1 Key Generation Standards

| Attribute | Specification |
|-----------|-------------|
| Algorithm | RSA 4096-bit or Ed25519 |
| Expiration | 2 years maximum |
| Subkeys | Separate signing and encryption subkeys |
| Passphrase | Hardware token (YubiKey) required |
| Storage | Offline air-gapped machine; YubiKey for signing |
| Backup | Shamir's Secret Sharing (3-of-5 split) |

### 6.2 Key Rotation

| Trigger | Procedure |
|---------|-----------|
| Scheduled (annual) | Publish new key 60 days before expiration; dual-sign transition period |
| Compromise | Emergency revocation; immediate new key generation; public notification |
| Staff change | New key generated by incoming ED; old key revoked 30 days after transition |

---

## 7. REFERENCES

- [EFF Warrant Canary FAQ](https://www.eff.org/deeplinks/2014/04/warrant-canary-faq)
- [Riseup Warrant Canary](https://riseup.net/en/about-us/press/canary-statement) — Long-running example
- [Apple Transparency Reports](https://www.apple.com/legal/transparency/) — Corporate example
- [Cloudflare Transparency Reports](https://www.cloudflare.com/transparency/) — Infrastructure example

---

*This warrant canary system is operational. All CIVWATCH users are encouraged to verify canaries regularly.*

*Last Updated: 2026-06-24 | Next Update: 2026-07-24*
