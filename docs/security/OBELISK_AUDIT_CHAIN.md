# CIVWATCH OBELISK-Style Immutable Audit Chain

> **Document Classification**: SECURITY-CORE | **Status**: SPECIFICATION
> **Purpose**: Cryptographically verifiable, tamper-evident audit trail for all data modifications
> **Standard**: NIST SP 800-53 AU-6 | **Inspiration**: OBELISK (Cross-repo agent governance)

---

## 1. EXECUTIVE SUMMARY

The OBELISK Audit Chain provides cryptographic guarantees that CIVWATCH data has not been tampered with, backdated, or selectively modified. Every data modification — ingestion, correction, redaction, deletion — is hashed and chained, creating an immutable timeline of platform activity.

> **Threat Model**: Protects against data poisoning, insider threats, government compelled modification, and retroactive tampering.

---

## 2. ARCHITECTURE

### 2.1 Hash Chain Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OBELISK AUDIT CHAIN                               │
│                                                                      │
│  BLOCK 0 (Genesis)                                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  block_height: 0                                             │    │
│  │  timestamp: 2026-06-24T00:00:00Z                             │    │
│  │  previous_hash: "0x0000...0000" (32 zero bytes)              │    │
│  │  merkle_root: hash of genesis data                           │    │
│  │  block_hash: SHA-256(genesis)                                │    │
│  │  data: "CIVWATCH GENESIS BLOCK v1.0"                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  BLOCK 1                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  block_height: 1                                             │    │
│  │  timestamp: 2026-06-24T01:15:23Z                             │    │
│  │  previous_hash: "0xabc1...def2" (hash of block 0)            │    │
│  │  merkle_root: hash of 150 data modifications                 │    │
│  │  block_hash: SHA-256(block_1_header + merkle_root)           │    │
│  │  data: [150 ingestion records for FEC Schedule A]            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  BLOCK 2                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  block_height: 2                                             │    │
│  │  timestamp: 2026-06-24T02:30:45Z                             │    │
│  │  previous_hash: "0xdef3...abc4" (hash of block 1)            │    │
│  │  merkle_root: hash of 200 data modifications                 │    │
│  │  block_hash: SHA-256(block_2_header + merkle_root)           │    │
│  │  data: [200 ingestion records + 1 correction]                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│                           ...                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Block Header Specification

```json
{
  "block_header": {
    "version": 1,
    "block_height": 1508473,
    "timestamp": "2026-06-24T14:30:00Z",
    "previous_hash": "sha256:abc123def456789012345678901234567890abcd",
    "merkle_root": "sha256:def789abc0123456789012345678901234567890",
    "block_hash": "sha256:a1b2c3d4e5f6789012345678901234567890abcd",
    "validator": "civwatch-node-1",
    "signature": "ed25519:sig_here"
  },
  "metadata": {
    "block_type": "ingestion",
    "data_source": "fec_api",
    "record_count": 500,
    "size_bytes": 256000,
    "compression": "zstd"
  }
}
```

### 2.3 Merkle Tree Structure

```python
class MerkleTree:
    """
    Binary Merkle tree for efficient verification of individual records.
    """
    
    def __init__(self, records: List[AuditRecord]):
        self.leaves = [self._hash_record(r) for r in records]
        self.tree = self._build_tree(self.leaves)
        self.root = self.tree[0][0] if self.tree else None
    
    def _hash_record(self, record: AuditRecord) -> str:
        """Hash a single audit record."""
        canonical = json.dumps(record, sort_keys=True, ensure_ascii=True)
        return hashlib.sha256(canonical.encode()).hexdigest()
    
    def _build_tree(self, leaves: List[str]) -> List[List[str]]:
        """Build Merkle tree from leaves."""
        tree = [leaves]
        current_level = leaves
        
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                next_level.append(hashlib.sha256((left + right).encode()).hexdigest())
            tree.append(next_level)
            current_level = next_level
        
        return tree
    
    def get_proof(self, index: int) -> List[Tuple[str, str]]:
        """Get Merkle proof for record at index."""
        proof = []
        for level in self.tree[:-1]:
            sibling_index = index + 1 if index % 2 == 0 else index - 1
            if sibling_index < len(level):
                direction = "right" if index % 2 == 0 else "left"
                proof.append((direction, level[sibling_index]))
            index //= 2
        return proof
    
    def verify_proof(self, record_hash: str, index: int, proof: List[Tuple[str, str]], root: str) -> bool:
        """Verify a record against the Merkle root."""
        current = record_hash
        for direction, sibling_hash in proof:
            if direction == "right":
                current = hashlib.sha256((current + sibling_hash).encode()).hexdigest()
            else:
                current = hashlib.sha256((sibling_hash + current).encode()).hexdigest()
        return current == root
```

---

## 3. AUDIT RECORD TYPES

### 3.1 Record Type Registry

| Type Code | Description | Trigger | Retention |
|-----------|-------------|---------|-----------|
| `INGEST` | Data ingestion | New records from external source | Permanent |
| `CORRECT` | Data correction | Error identified and fixed | Permanent |
| `REDACT` | Data redaction | PII or privacy concern | Permanent |
| `DELETE` | Soft deletion | Legal requirement or policy | Permanent (with reason) |
| `ANNOTATE` | Metadata addition | Enrichment or analysis | Permanent |
| `VERIFY` | Source verification | Cryptographic or manual verification | Permanent |
| `ALERT` | Anomaly alert | Automated or manual anomaly detection | Permanent |
| `ACCESS` | Data access log | User/API access to sensitive data | 90 days |
| `CONFIG` | Configuration change | System setting modification | 7 years |
| `ADMIN` | Administrative action | User management, role changes | 7 years |

### 3.2 Example: Ingestion Record

```json
{
  "record_type": "INGEST",
  "record_id": "audit_20260624_143000_001",
  "timestamp": "2026-06-24T14:30:00Z",
  "actor": {
    "type": "system",
    "id": "ingestion-pipeline-fec",
    "ip": null,
    "session_id": null
  },
  "target": {
    "resource_type": "fec_contribution",
    "resource_id": "fec_sch_a_2026_c1234567_89012345",
    "table": "fec_contributions",
    "schema_version": "v2.1"
  },
  "action": {
    "operation": "INSERT",
    "fields_changed": ["all"],
    "previous_state": null,
    "new_state_hash": "sha256:state_hash_here"
  },
  "provenance": {
    "source_system": "fec_api",
    "source_endpoint": "/v1/schedules/schedule_a/",
    "source_record_id": "SA1234567890",
    "source_timestamp": "2026-04-10T12:00:00Z",
    "ingestion_batch": "batch_20260624_001"
  },
  "verification": {
    "schema_valid": true,
    "pii_scrubbed": true,
    "dupe_checked": true,
    "anomaly_score": 0.02,
    "confidence": 0.98
  },
  "hash": "sha256:record_hash_here",
  "previous_record_hash": "sha256:previous_record_hash",
  "block_height": 1508473,
  "merkle_index": 42
}
```

### 3.3 Example: Correction Record

```json
{
  "record_type": "CORRECT",
  "record_id": "audit_20260624_150000_042",
  "timestamp": "2026-06-24T15:00:00Z",
  "actor": {
    "type": "human",
    "id": "user_ethics_officer_001",
    "ip": "10.0.0.100",
    "session_id": "sess_abc123"
  },
  "target": {
    "resource_type": "fec_contribution",
    "resource_id": "fec_sch_a_2026_c1234567_89012345",
    "table": "fec_contributions",
    "schema_version": "v2.1"
  },
  "action": {
    "operation": "UPDATE",
    "fields_changed": ["contributor.employer"],
    "previous_state_hash": "sha256:old_state_hash",
    "new_state_hash": "sha256:new_state_hash",
    "correction_reason": "Employer name correction per FEC amendment filing",
    "correction_source": "fec_api_amendment_SA1234567890_A1"
  },
  "provenance": {
    "original_ingestion_record": "audit_20260624_143000_001",
    "correction_authority": "ethics_committee",
    "four_eyes_approved_by": "user_senior_editor_001"
  },
  "hash": "sha256:record_hash_here",
  "previous_record_hash": "sha256:previous_record_hash",
  "block_height": 1508474,
  "merkle_index": 150
}
```

---

## 4. MULTI-AGENT CONSENSUS (OBELISK Integration)

### 4.1 Consensus Requirements

Per OBELISK governance: **No single agent can unilaterally modify data.**

| Action | Required Consensus | Agents Involved |
|--------|-------------------|----------------|
| **Data ingestion** | 2-of-3 ingestion agents | Ingestion validators |
| **Anomaly flagging** | 3-of-5 detection agents | Anomaly detectors |
| **Data correction** | 2-of-3 + human approval | Correction agents + ethics officer |
| **Redaction** | 2-of-3 + human approval | Redaction agents + privacy officer |
| **Configuration change** | 3-of-5 admin agents | Admin agents |
| **Emergency action** | Incident commander + 2-of-3 | Emergency response team |

### 4.2 Consensus Protocol

```python
class ObeliskConsensus:
    """
    Byzantine fault-tolerant consensus for data modifications.
    Ensures no single compromised agent can modify data.
    """
    
    def __init__(self, threshold: int, total_agents: int):
        self.threshold = threshold  # e.g., 3
        self.total_agents = total_agents  # e.g., 5
        self.agent_votes = {}
    
    def propose_modification(self, proposal: ModificationProposal, proposing_agent: str) -> bool:
        """
        Propose a data modification. Requires threshold approvals.
        """
        proposal_id = proposal.get_id()
        self.agent_votes[proposal_id] = {proposing_agent: "APPROVE"}
        
        # Broadcast to all agents
        for agent in self.get_all_agents():
            if agent != proposing_agent:
                vote = agent.evaluate(proposal)
                self.agent_votes[proposal_id][agent.id] = vote
        
        # Count approvals
        approvals = sum(1 for v in self.agent_votes[proposal_id].values() if v == "APPROVE")
        
        if approvals >= self.threshold:
            # Execute modification and log to audit chain
            self.execute_modification(proposal)
            self.log_consensus(proposal_id, self.agent_votes[proposal_id])
            return True
        else:
            # Log failed consensus attempt
            self.log_consensus_failure(proposal_id, self.agent_votes[proposal_id])
            return False
    
    def detect_byzantine_agents(self) -> List[str]:
        """
        Detect agents that consistently vote differently from the majority.
        Flagged for investigation, not auto-excluded (to prevent capture).
        """
        suspicious = []
        for agent in self.get_all_agents():
            deviation_score = self.calculate_deviation(agent)
            if deviation_score > 0.8:  # 80% deviation from majority
                suspicious.append(agent.id)
        return suspicious
```

---

## 5. EXTERNAL VERIFICATION

### 5.1 Public Audit Interface

```python
# API endpoint: GET /api/v1/audit/verify/{record_id}

class AuditVerificationAPI:
    
    def verify_record(self, record_id: str) -> VerificationResult:
        """
        Verify a record's integrity against the audit chain.
        Public endpoint — anyone can verify.
        """
        record = self.audit_store.get_record(record_id)
        block = self.blockchain.get_block(record.block_height)
        
        # Verify record hash
        computed_hash = self.compute_record_hash(record)
        assert computed_hash == record.hash, "Record hash mismatch!"
        
        # Verify Merkle proof
        merkle_valid = self.merkle_tree.verify_proof(
            record.hash, 
            record.merkle_index,
            block.get_proof(record.merkle_index),
            block.header.merkle_root
        )
        assert merkle_valid, "Merkle proof invalid!"
        
        # Verify chain integrity
        chain_valid = self.verify_chain(record.block_height)
        
        return {
            "record_id": record_id,
            "hash_valid": computed_hash == record.hash,
            "merkle_valid": merkle_valid,
            "chain_valid": chain_valid,
            "block_height": record.block_height,
            "timestamp": record.timestamp,
            "confirmations": self.get_latest_height() - record.block_height
        }
    
    def verify_chain(self, up_to_height: int) -> bool:
        """Verify the entire chain up to specified height."""
        for height in range(1, up_to_height + 1):
            block = self.blockchain.get_block(height)
            previous = self.blockchain.get_block(height - 1)
            
            assert block.header.previous_hash == previous.header.block_hash, \
                f"Chain broken at height {height}!"
            
            assert self.verify_block_hash(block), \
                f"Block hash invalid at height {height}!"
        
        return True
```

### 5.2 Third-Party Mirror

| Mirror Operator | Location | Update Frequency | Verification Method |
|----------------|----------|-----------------|---------------------|
| **Internet Archive** | archive.org | Daily | rsync + hash verification |
| **Academic partner** | TBD | Daily | API sync + Merkle verification |
| **Community mirror** | TBD | Weekly | git + GPG signed commits |

---

## 6. DISASTER RECOVERY

### 6.1 Backup Strategy

| Component | Frequency | Storage | Encryption |
|-----------|-----------|---------|------------|
| Audit chain blocks | Real-time (append-only) | S3 Glacier + local | AES-256-GCM |
| Merkle tree state | Hourly | S3 + local | AES-256-GCM |
| Validator keys | On generation | Hardware security module | HSM-protected |
| Consensus logs | Real-time | PostgreSQL + S3 | AES-256-GCM |

### 6.2 Recovery Procedures

| Scenario | Recovery Time | Procedure |
|----------|--------------|-----------|
| Single node failure | < 5 minutes | Consensus continues with remaining nodes |
| Multiple node failure | < 30 minutes | Restore from backup; verify chain integrity |
| Chain corruption | < 2 hours | Restore from last verified checkpoint; replay |
| Complete infrastructure loss | < 24 hours | Restore from S3 Glacier; verify from third-party mirrors |
| Government compelled shutdown | N/A | Third-party mirrors continue operation; warrant canary updated |

---

## 7. METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Block production rate | 1 block/15 minutes | Block timestamps |
| Chain verification time | < 10 seconds for full chain | Benchmark |
| Audit record latency | < 1 second from operation to record | End-to-end timing |
| Consensus达成 time | < 30 seconds | Proposal to execution |
| Byzantine agent detection | < 5 minutes | Detection latency |
| Mirror sync lag | < 1 hour | Mirror block height diff |

---

## 8. REFERENCES

- [NIST SP 800-53 Rev. 5 — AU-6: Audit Review](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [NIST SP 800-53 Rev. 5 — AU-10: Non-repudiation](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [Certificate Transparency (RFC 6962)](https://tools.ietf.org/html/rfc6962)
- [Merkle Trees (Bitcoin reference)](https://en.bitcoin.it/wiki/Merkle_tree)
- [OBELISK Agent Governance Specification](../README-OBELISK.md)

---

*This specification defines the OBELISK Audit Chain for CIVWATCH. Implementation follows this specification. All modifications require consensus per section 4.*

*Last Updated: 2026-06-24 | Version: 1.0*
