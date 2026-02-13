# High-Scale Energy Ingestion Engine

## Overview

This project implements a **high-scale telemetry ingestion and analytics backend** for a fleet platform managing **10,000+ Smart Meters and EVs**.

The system ingests **two independent 1-minute heartbeat streams**, correlates energy usage, and exposes **fast analytical insights** without performing full historical table scans.

**Tech Stack**

* NestJS (TypeScript)
* PostgreSQL
* TypeORM
* Docker & Docker Compose

---

## Problem Context

Each device sends telemetry every **60 seconds**.

### Smart Meter (Grid Side)

* `meterId`
* `kwhConsumedAc`
* `voltage`
* `timestamp`

Represents **AC energy billed from the grid**.

### EV & Charger (Vehicle Side)

* `vehicleId`
* `soc`
* `kwhDeliveredDc`
* `batteryTemp`
* `timestamp`

Represents **DC energy stored in the battery**.

### Key Insight

Due to **conversion losses**:

```
AC Consumed > DC Delivered
```

Efficiency below **~85%** may indicate:

* Charger inefficiency
* Hardware fault
* Energy leakage

---

## Architecture Design

### 1. Polymorphic Ingestion

A **single ingestion endpoint** automatically detects payload type and routes to:

* Vehicle telemetry pipeline
* Meter telemetry pipeline

---

### 2. Hot vs Cold Data Strategy

#### Hot Tables (Operational State)

Used for **real-time dashboard lookups**.

Tables:

* `vehicle_status`
* `meter_status`

Characteristics:

* **UPSERT-based updates**
* Constant-time reads
* Avoids scanning historical telemetry

---

#### Cold Tables (Historical Telemetry)

Used for **analytics and auditing**.

Tables:

* `vehicle_telemetry`
* `meter_telemetry`

Characteristics:

* **Append-only INSERT**
* Indexed by `(deviceId, timestamp)`
* Scales to **billions of rows**

---

### 3. Scale Consideration

With:

```
10,000 devices × 1 record/min × 24 hours
≈ 14.4 million records/day
```

Design ensures:

* No full table scans
* Indexed time-range analytics
* Separation of operational vs analytical workloads

---

## API Endpoints

### Ingest Telemetry

**POST** `/v1/telemetry`

#### Vehicle Payload

```json
{
  "vehicleId": "V1",
  "soc": 80,
  "kwhDeliveredDc": 12.5,
  "batteryTemp": 32,
  "timestamp": "2026-02-12T10:00:00Z"
}
```

#### Meter Payload

```json
{
  "meterId": "M1",
  "kwhConsumedAc": 15,
  "voltage": 230,
  "timestamp": "2026-02-12T10:00:00Z"
}
```

---

### 24-Hour Performance Analytics

**GET** `/v1/analytics/performance/:vehicleId`

Returns:

* Total AC consumed
* Total DC delivered
* Efficiency ratio (`DC / AC`)
* Average battery temperature

**Example Response**

```json
{
  "vehicleId": "V1",
  "last24h": {
    "totalAc": 15,
    "totalDc": 12.5,
    "efficiency": 0.83,
    "avgBatteryTemp": 32
  }
}
```

---

## Running the Project

### Prerequisites

* Docker Desktop installed
* Node.js ≥ 18 (for local dev)

---

### Start Full System

```bash
docker compose up --build
```

Services:

* PostgreSQL → **port 5432**
* Backend API → **port 3000**

---

### Verify Backend

Open in browser:

```
http://localhost:3000/v1
```

---

## Database Design Summary

### Hot Tables

* Fast **UPSERT state tracking**
* Optimized for **real-time dashboards**

### Cold Tables

* **Append-only telemetry history**
* Indexed for **time-bounded analytics**
* Supports **very high write throughput**

---

## Performance Strategy

Avoids **full table scans** by:

* Querying **last-24-hour windows**
* Using **composite indexes**
* Separating **write-heavy** and **read-heavy** paths

---

## Future Production Improvements

* PostgreSQL **time partitioning**
* **Kafka/RabbitMQ** ingestion buffering
* **Read replicas** for analytics
* **Redis caching** for dashboards
* **Efficiency anomaly detection**

---

## Key Engineering Decisions

* **Insert vs Upsert separation**
  Ensures audit history + fast current state.

* **Hot/Cold storage split**
  Critical for **14M+ daily writes**.

* **Versioned API (`/v1`)**
  Enables backward-compatible evolution.


