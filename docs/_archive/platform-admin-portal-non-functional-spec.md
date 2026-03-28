# Platform Admin Portal — Non-Functional Requirements

This document outlines the operational and quality standards for the Platform Admin Portal, ensuring the SaaS Control Plane is secure, performant, and reliable.

## Security

- **Role-Based Access Control (RBAC)**: Strict enforcement of administrative scopes. Only users with `PLATFORM_ADMIN` status can access management endpoints.
- **Admin Action Audit Logs**: Every destructive or configuration-altering action is captured immutably in a global audit log with JSON diffs for state tracking.
- **Secure API Key Handling**: Access keys are stored as hashed values (Bcrypt). Raw values are only visible once upon generation via the high-fidelity secure gateway.
- **Tenant Isolation**: Strict logical separation ensures administrative actions on one tenant context do not leak data or state into another.

## Performance

- **Acceptable Response Times**: All management dashboard queries aim for < 300ms response time. Heavy aggregation (e.g., global revenue trends) is optimized via database indexing.
- **Caching Strategy**: Implementation of a high-speed telemetry proxy for frequently accessed system metrics and health heartbeats.
- **Metrics Monitoring**: Real-time monitoring of resource utilization queues to prevent management console latency during high platform load.

## Observability

- **API Key Telemetry**: Granular request tracking (volume, method, status) visualized through interactive pulse charts.
- **System Health Monitoring**: 360-degree heartbeat visibility covering Primary DB, Redis/Cache, CPU, Memory, and Uptime.
- **Error Tracking**: Global error boundaries in the frontend and structured exception logging in the backend NestJS filters.
- **Logging**: High-fidelity audit stream and operational logging in dedicated service descriptors.

## Reliability

- **Failure Handling**: Graceful degradation of monitoring dashboards if telemetry probes time out.
- **Retry Policies**: Exponential backoff for critical infrastructure probes (DB/Cache).
- **Cluster Resilience**: Administrative interventions (Suspend/Reactivate) use atomic database transactions to ensure system state consistency.

## Scalability

- **Multi-Tenant Capacity**: Architecture supports 10,000+ isolated tenant nodes with sub-second registry resolution.
- **Horizontal Scaling Readiness**: Backend services are stateless, allowing for deployment across multiple cluster nodes behind a load balancer.

## Localization

- **English and Arabic Dictionaries**: 1:1 parity maintained across 500+ translation keys in both languages.
- **RTL Compatibility**: Systematic Right-to-Left alignment for all UI components, including RTL-aware charts and sidebar navigation.
- **Translation Fallback Strategy**: Sophisticated fallback mechanism (AR -> EN) in the `LanguageContext` to prevent empty UI elements if keys are missing in secondary locales.

## Compliance

- **Configuration History**: All changes to `SystemConfig` and `FeatureFlags` are audited, providing a trail of historical environment states.
- **Auditability of Admin Actions**: Complete traceability from Actor ID to Resource ID for every operation performed within the portal.
