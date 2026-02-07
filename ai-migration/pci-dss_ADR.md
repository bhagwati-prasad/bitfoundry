---

## ADR-001: Segmentation of the Cardholder Data Environment (CDE)

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS requires limiting the scope of systems that store, process, or transmit cardholder data (CHD). Reducing scope minimizes risk and compliance overhead.

### Decision

We will implement **network and logical segmentation** to isolate the Cardholder Data Environment (CDE) from non-CDE systems.

Segmentation controls include:

* Dedicated VPC/VNet or VLANs for CDE workloads
* Layer 3/4 firewall rules restricting ingress/egress
* Zero-trust access controls for administrative access
* No direct connectivity from public networks to CDE systems

### Consequences

**Positive**

* Reduced PCI scope
* Smaller attack surface
* Easier audits and evidence collection

**Negative**

* Additional network complexity
* Requires ongoing rule reviews and validation testing

---

## ADR-002: Prohibition of Storage of Sensitive Authentication Data

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS explicitly prohibits storage of sensitive authentication data (SAD) after authorization (e.g., CVV, PIN blocks).

### Decision

The system **must not store**:

* CVV/CVC/CID
* PIN or PIN blocks
* Full magnetic stripe or chip data

Application logic and logging frameworks are designed to:

* Reject attempts to persist SAD
* Mask or redact sensitive fields in logs
* Enforce schema validation to prevent accidental storage

### Consequences

**Positive**

* Direct compliance with PCI-DSS requirements
* Lower breach impact

**Negative**

* Limits debugging data
* Requires careful logging discipline by developers

---

## ADR-003: Encryption of Cardholder Data at Rest and in Transit

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS requires strong cryptography for CHD both at rest and in transit.

### Decision

* **At Rest:**

  * CHD is encrypted using AES-256 or equivalent
  * Encryption keys are managed using a centralized KMS/HSM
* **In Transit:**

  * TLS 1.2+ is required for all CHD transmission
  * Mutual TLS is used for internal service-to-service communication where feasible

Key access is restricted by role and logged.

### Consequences

**Positive**

* Strong protection against data exfiltration
* Clear audit evidence

**Negative**

* Slight performance overhead
* Key rotation and access management require discipline

---

## ADR-004: Tokenization of Primary Account Numbers (PAN)

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

Storing PAN increases PCI scope and breach risk.

### Decision

PANs will be replaced with **non-reversible tokens** wherever possible.
Only a minimal set of systems (token vault) may access raw PAN data.

* Tokens are used for internal references and reporting
* Token vault access is strictly limited and monitored

### Consequences

**Positive**

* Dramatic reduction in PCI scope
* Lower breach impact

**Negative**

* Dependency on tokenization service availability
* Slight increase in architectural complexity

---

## ADR-005: Centralized Authentication and Role-Based Access Control (RBAC)

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS requires strong access control and least-privilege enforcement.

### Decision

* All access to CDE systems uses centralized identity management
* RBAC is enforced at:

  * Application layer
  * Infrastructure layer
* Administrative access requires:

  * Unique user IDs
  * Multi-factor authentication (MFA)

Access reviews occur at least quarterly.

### Consequences

**Positive**

* Clear accountability
* Easier user lifecycle management

**Negative**

* Requires mature IAM processes
* Initial role modeling effort

---

## ADR-006: Logging, Monitoring, and Retention for Security Events

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS mandates logging of access to system components and CHD.

### Decision

* All CDE systems send logs to a centralized, tamper-resistant logging platform
* Logged events include:

  * Authentication attempts
  * Access to CHD
  * Configuration changes
* Logs are retained for:

  * Minimum 12 months
  * At least 3 months immediately available

### Consequences

**Positive**

* Strong forensic and audit capabilities
* Faster incident response

**Negative**

* Storage and SIEM costs
* Requires tuning to reduce noise

---

## ADR-007: Vulnerability Management and Patch Strategy

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

PCI-DSS requires proactive vulnerability management and secure system maintenance.

### Decision

* Quarterly external and internal vulnerability scans
* Authenticated scanning for CDE systems
* Critical security patches applied within defined SLAs
* Annual penetration testing and after significant changes

### Consequences

**Positive**

* Reduced risk of exploitable vulnerabilities
* Clear compliance evidence

**Negative**

* Operational overhead
* Requires coordination with change management

---

## ADR-008: Use of PCI-Compliant Third-Party Service Providers

**Status:** Accepted
**Date:** YYYY-MM-DD

### Context

Third parties handling CHD can introduce compliance risk.

### Decision

* Only PCI-DSS–compliant service providers may handle CHD
* Compliance validation (AOC/ROC) is required annually
* Responsibility matrix (shared responsibility) is documented

### Consequences

**Positive**

* Reduced vendor risk
* Clear compliance boundaries

**Negative**

* Limits vendor selection
* Ongoing vendor review effort

---

Perfect—here’s a **direct, auditor-friendly mapping of each ADR to PCI-DSS v4.0 requirement numbers**. This aligns cleanly with the standard language auditors expect to see.

---

## ADR ↔ PCI-DSS v4.0 Requirements Mapping

### **ADR-001: Segmentation of the Cardholder Data Environment (CDE)**

**Primary Requirements**

* **1.2.3** – Network security controls restrict inbound and outbound traffic
* **1.2.4** – Network connections between trusted and untrusted networks are controlled
* **1.3.1** – CDE is isolated from untrusted networks
* **1.4.4** – Segmentation controls are implemented and validated

**Why auditors care:**
This ADR directly defines PCI scope and proves intentional isolation of CHD systems.

---

### **ADR-002: Prohibition of Storage of Sensitive Authentication Data**

**Primary Requirements**

* **3.3.1** – Sensitive authentication data is not stored after authorization
* **3.3.2** – SAD is not logged
* **3.2.1** – Storage of SAD is prohibited even if encrypted

**Why auditors care:**
This is a *hard prohibition* in PCI. Violations here are automatic failures.

---

### **ADR-003: Encryption of Cardholder Data at Rest and in Transit**

**Primary Requirements**

* **3.5.1** – PAN is rendered unreadable anywhere it is stored
* **3.5.2** – Disk-level or file-level encryption is implemented
* **3.6.1** – Cryptographic keys are protected
* **4.2.1** – Strong cryptography for transmission of CHD
* **4.2.2** – Secure protocols and cipher suites are used

**Why auditors care:**
This demonstrates defense-in-depth and modern cryptography alignment.

---

### **ADR-004: Tokenization of Primary Account Numbers (PAN)**

**Primary Requirements**

* **3.4.1** – PAN is masked when displayed
* **3.5.1** – PAN rendered unreadable via tokenization
* **2.2.1** – Scope reduction via architectural design

**Why auditors care:**
Tokenization is one of the strongest scope-reduction strategies in PCI.

---

### **ADR-005: Centralized Authentication and Role-Based Access Control (RBAC)**

**Primary Requirements**

* **7.2.1** – Access is based on least privilege
* **7.2.4** – Access roles and responsibilities are documented
* **8.2.1** – Unique IDs for all users
* **8.4.2** – MFA for administrative access
* **8.6.1** – Access reviews are performed periodically

**Why auditors care:**
This proves accountability, traceability, and access governance.

---

### **ADR-006: Logging, Monitoring, and Retention for Security Events**

**Primary Requirements**

* **10.2.1** – Audit logs are enabled for critical events
* **10.2.2** – Logs capture access to CHD
* **10.3.1** – Audit log entries include required elements
* **10.4.1** – Logs are protected from modification
* **10.5.1** – Logs are retained for at least 12 months

**Why auditors care:**
Logs are the backbone of incident detection and forensic analysis.

---

### **ADR-007: Vulnerability Management and Patch Strategy**

**Primary Requirements**

* **6.3.1** – Security vulnerabilities are identified and addressed
* **6.3.3** – Critical patches are installed within defined timelines
* **11.3.1** – External vulnerability scans
* **11.3.2** – Internal vulnerability scans
* **11.4.1** – Penetration testing performed annually and after changes

**Why auditors care:**
Shows proactive risk management rather than reactive fixes.

---

### **ADR-008: Use of PCI-Compliant Third-Party Service Providers**

**Primary Requirements**

* **12.8.1** – Service providers are managed with written agreements
* **12.8.2** – Providers acknowledge responsibility for CHD security
* **12.8.4** – Providers’ PCI compliance status is monitored
* **12.9.1** – Responsibility matrix (shared responsibility model)

**Why auditors care:**
Third parties are one of the biggest PCI failure points.

---

Great question—and the honest answer is: **they’re intentionally cross-functional**, but they *land* differently for each audience.

Here’s how to think about it in a way that usually clicks with both engineers and auditors.

---

## The short, real answer

These ADRs are **primarily for Developers and DevOps**, with **testing teams using them as acceptance and verification criteria**.

They are *not* owned by just one group.

---

## How each team should use these ADRs

### 🧑‍💻 Developers (primary consumers)

**What the ADRs mean for them**

* Define **what is allowed and forbidden** in code
* Set non-negotiable constraints (e.g., “you cannot store CVV, ever”)
* Clarify architectural expectations (tokenization, encryption, logging behavior)

**Examples**

* ADR-002 → “Never persist or log CVV”
* ADR-004 → “Use tokens, not PANs, in application logic”
* ADR-003 → “TLS 1.2+ is mandatory for all services”

**Why devs care**

* Prevents accidental PCI violations
* Removes ambiguity during design reviews
* Becomes a reference during PR reviews and incident postmortems

---

### ⚙️ DevOps / Platform / SRE (primary consumers)

**What the ADRs mean for them**

* Define **infrastructure and operational controls**
* Drive cloud/network design, IAM, logging, and patching
* Establish guardrails in CI/CD and runtime environments

**Examples**

* ADR-001 → Network segmentation, firewall rules, VPC design
* ADR-005 → IAM, MFA, RBAC enforcement
* ADR-006 → Centralized logging, SIEM retention
* ADR-007 → Scanning pipelines, patch SLAs

**Why DevOps cares**

* Clear authority to enforce controls
* Easier automation of compliance
* Strong audit evidence tied to architecture decisions

---

### 🧪 QA / Security Testing (secondary but critical consumers)

**What the ADRs mean for them**

* Provide **testable assertions**
* Define *what must be verified*, not just how software behaves

**Examples**

* ADR-002 → Verify CVV never appears in DB, logs, traces
* ADR-003 → Validate TLS configs and cipher suites
* ADR-006 → Confirm logs exist, are immutable, and retained
* ADR-007 → Ensure scans and pen tests actually run

**Why testers care**

* Turns vague PCI requirements into concrete test cases
* Aligns functional testing with security compliance
* Reduces “but I didn’t know” failures late in audits

---

## Who owns ADRs like these?

Best-practice ownership looks like this:

| Role                        | Responsibility                                   |
| --------------------------- | ------------------------------------------------ |
| **Security / Architecture** | Author & approve ADRs                            |
| **Developers**              | Implement application-level decisions            |
| **DevOps / SRE**            | Implement infrastructure & operational decisions |
| **QA / Security Testing**   | Verify adherence                                 |
| **Compliance / GRC**        | Map ADRs to PCI requirements & evidence          |

---

## How auditors see them (important)

Auditors love these ADRs because they:

* Show **intentional design**, not accidental compliance
* Bridge **PCI requirements → technical implementation**
* Provide a clean narrative: *decision → control → evidence*

They’re often used as **supporting artifacts**, not as operational procedures.

---

# Developer-Focused ADRs

*(Application architecture, code behavior, data handling)*

These ADRs define **what the application is allowed to do** and **what developers must never implement**.

---

## **DEV-ADR-001: Prohibition of Storage of Sensitive Authentication Data**

**Derived from:** ADR-002

**Primary Owners:** Application developers
**Secondary:** Security, QA

**Scope**

* Application code
* ORMs / persistence layers
* Logging frameworks
* API payload handling

**Key Developer Obligations**

* Never store or log CVV, PIN, magnetic stripe data
* Enforce schema validation to prevent SAD persistence
* Mask or drop sensitive fields before logging

**PCI-DSS v4.0**

* 3.2.1
* 3.3.1
* 3.3.2

---

## **DEV-ADR-002: Tokenization of PAN in Application Logic**

**Derived from:** ADR-004

**Primary Owners:** Application developers
**Secondary:** Platform, Security

**Scope**

* Business logic
* APIs
* Data models
* Reporting services

**Key Developer Obligations**

* Use tokens instead of PAN wherever possible
* No business logic may depend on raw PAN
* Mask PAN when display is required

**PCI-DSS v4.0**

* 3.4.1
* 3.5.1
* 2.2.1

---

## **DEV-ADR-003: Encryption Usage in Application Code**

**Derived from:** ADR-003

**Primary Owners:** Application developers
**Secondary:** DevOps

**Scope**

* Service-to-service communication
* API clients
* SDKs

**Key Developer Obligations**

* Use approved TLS versions and cipher suites
* Never bypass certificate validation
* Use platform-provided crypto libraries only

**PCI-DSS v4.0**

* 4.2.1
* 4.2.2

---

## **DEV-ADR-004: Secure Logging and Error Handling**

**Derived from:** ADR-006

**Primary Owners:** Application developers
**Secondary:** DevOps, Security

**Scope**

* Application logs
* Error handling
* Tracing

**Key Developer Obligations**

* Do not log CHD or SAD
* Use structured logging
* Ensure logs include user/context IDs where appropriate

**PCI-DSS v4.0**

* 10.2.2
* 10.3.1

---

# DevOps-Focused ADRs

*(Infrastructure, networks, IAM, operations)*

These ADRs define **how the platform enforces PCI controls** regardless of application behavior.

---

## **OPS-ADR-001: Segmentation of the Cardholder Data Environment**

**Derived from:** ADR-001

**Primary Owners:** DevOps / Platform / Network teams
**Secondary:** Security

**Scope**

* VPC/VNet design
* Firewalls
* Routing
* Bastion access

**Key DevOps Obligations**

* Isolate CDE from non-CDE networks
* Restrict ingress/egress by default
* Validate segmentation periodically

**PCI-DSS v4.0**

* 1.2.3
* 1.2.4
* 1.3.1
* 1.4.4

---

## **OPS-ADR-002: Encryption of Cardholder Data at Rest**

**Derived from:** ADR-003

**Primary Owners:** DevOps / Platform
**Secondary:** Security

**Scope**

* Databases
* Storage
* Backups
* Key management

**Key DevOps Obligations**

* Encrypt CHD using strong cryptography
* Centralize key management (KMS/HSM)
* Enforce key rotation and access controls

**PCI-DSS v4.0**

* 3.5.1
* 3.5.2
* 3.6.1

---

## **OPS-ADR-003: Centralized Authentication, MFA, and RBAC**

**Derived from:** ADR-005

**Primary Owners:** DevOps / IAM
**Secondary:** Security

**Scope**

* IAM
* Admin access
* CI/CD access
* Cloud consoles

**Key DevOps Obligations**

* Enforce unique IDs and MFA
* Implement least-privilege roles
* Perform periodic access reviews

**PCI-DSS v4.0**

* 7.2.1
* 7.2.4
* 8.2.1
* 8.4.2
* 8.6.1

---

## **OPS-ADR-004: Centralized Logging, Monitoring, and Retention**

**Derived from:** ADR-006

**Primary Owners:** DevOps / SRE
**Secondary:** Security

**Scope**

* SIEM
* Log pipelines
* Storage
* Alerting

**Key DevOps Obligations**

* Centralize logs from all CDE systems
* Protect logs from modification
* Retain logs for PCI-mandated durations

**PCI-DSS v4.0**

* 10.2.1
* 10.4.1
* 10.5.1

---

## **OPS-ADR-005: Vulnerability Management and Patch Strategy**

**Derived from:** ADR-007

**Primary Owners:** DevOps / Security
**Secondary:** Engineering

**Scope**

* OS patching
* Container images
* CI/CD scanning
* Pen testing coordination

**Key DevOps Obligations**

* Run internal/external scans
* Patch within defined SLAs
* Coordinate annual pen tests

**PCI-DSS v4.0**

* 6.3.1
* 6.3.3
* 11.3.1
* 11.3.2
* 11.4.1

---

## **OPS-ADR-006: Management of PCI-Compliant Third-Party Providers**

**Derived from:** ADR-008

**Primary Owners:** DevOps / Security / GRC
**Secondary:** Legal, Procurement

**Scope**

* Vendor integrations
* SaaS providers
* Cloud services

**Key DevOps Obligations**

* Use only PCI-compliant providers for CHD
* Maintain AOCs and responsibility matrices
* Review compliance annually

**PCI-DSS v4.0**

* 12.8.1
* 12.8.2
* 12.8.4
* 12.9.1

---

## Shared Reality (important to call out)

Some ADRs are **enforced by DevOps but violated by devs if ignored**. Calling this out explicitly helps:

| Area         | Enforced By | Broken By |
| ------------ | ----------- | --------- |
| Logging      | DevOps      | Devs      |
| Encryption   | DevOps      | Devs      |
| Tokenization | Platform    | Devs      |

---
