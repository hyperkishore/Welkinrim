# PRD • “Motor Matchmaker & Procurement Assistant”  
*Version 1.0 – Aug 6 2025*  
Created by: Welkinrim Strategy-Execution Copilot  
Target release: MVP in **30 days**; full v1 in **90 days**

---

## 1. Purpose
Give drone OEMs a **single screen** to:
1. **Identify** the best-fit propulsion motor from Welkinrim’s catalogue **or** external vendors.
2. **Compare** price, lead time, and MOQ in an all-inclusive view (margin hidden).
3. **Trigger** either (a) direct purchase, (b) custom-motor RFQ, or (c) third-party procurement handled by Welkinrim.

This removes weeks of email ping-pong and positions Welkinrim as a full-stack propulsion partner.

---

## 2. Scope & Out-of-scope
| Included (v1) | Deferred / Out |
| --- | --- |
| Parametric search & ranking engine | Auto-CAD file generator for custom designs |
| Welkinrim catalogue ingestion (CSV ➜ DB) | Real-time inventory sync with ERP |
| Scraper/import for 3 external vendors (T-Motor, KDE, Sunnysky) | >3 vendors, DJI E-series, custom APIs |
| Automated timeline & cost calculator | PO & invoice generation |
| Dashboard for internal sales to adjust lead-time/price bands | Payment gateway integration |

---

## 3. Users & Stories
| Persona | Key Stories (acceptance criteria in §9) |
| --- | --- |
| **Design Engineer (DE)** | *As a DE* I input my flight specs and receive ≤10 motor options sorted by suitability score in <3 s. |
| **Procurement Lead (PL)** | *As a PL* I see MOQ, all-in price (list + Welkinrim markup hidden), and can export a comparison PDF. |
| **Sales Engineer (SE)** | *As an SE* I can override lead-time bands or mark a motor as “NLA” in admin. |
| **Program Manager (PM)** | *As a PM* I generate a custom-motor timeline & cost range from templates and email it to the customer with one click. |

---

## 4. Functional Requirements

### 4.1 Input Parameters
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| **All-Up Weight (kg)** | number | ✅ | Used for thrust calc |
| **Target Thrust-to-Weight Ratio** | number | ✅ | Default = 2.0 |
| **Battery Voltage (S count)** | dropdown (3–14 S) | ✅ | Drives motor KV filter |
| **Prop Diameter Range (inch)** | min-max sliders | ✅ | Matches motor torque curve |
| **Desired Flight Time (min)** | number | optional | Ranking bonus |
| **Payload Mass (kg)** | number | optional | Informative only |
| Motor Weight Preference (g) | number | optional | Soft filter |
| KV Preference | number | optional | Soft filter |
| IP Rating Needed (IP xx) | dropdown | optional | Hard filter |
| Operating Temp (°C) | range | optional | Hard filter |
| Annual Volume (units) | number | optional | Affects price tier |
| Vendor Preference | multiselect | optional | Hard filter if chosen |

*Validation:* required fields gray-out “Search” button until filled.

### 4.2 Data Model (`motors` table, core fields)

```
id | source(enum: internal, external) | brand | model | kv | max_current_a |
max_thrust_g | weight_g | voltage_min_s | voltage_max_s | prop_range_in |
ip_rating | price_usd | moq | stock_qty | lead_time_weeks | datasheet_url
```

### 4.3 Search & Ranking Algorithm
1. **Hard filters** → voltage, prop range, IP rating, KV ±15 %.  
2. **Suitability score (0-100):**  
   `score = 0.4*thrust_factor + 0.2*efficiency + 0.15*weight_penalty + 0.15*flight_time_bonus + 0.1*cost_penalty`
3. Return top 10; internal motors pinned top when score difference <5 pts.

### 4.4 Pricing & Lead-time Logic
| Scenario | Lead-time band | Price formula* | MOQ |
| --- | --- | --- | --- |
| Internal motor **in stock** | 1–2 weeks | `list_price * (1+margin)` | 1 |
| Internal motor **MTO** | 8–10 weeks | same | 20 |
| *Custom design* | 16–20 w prototype → +4 w prod | `dev_NRE + unit_cost * (1+margin)` | 50 |
| External vendor | vendor LT +2 w buffer | `vendor_price * (1+handling + margin)` | vendor MOQ |

\* Margin & handling percentages stored in secure env variables; **never exposed in UI**.

### 4.5 UI/UX (React component spec)
```
┌ InputSidebar ┐   ┌ ResultsTable ──────────────────────────────┐
| • form fields|   | Brand | Model | Thrust (g) | Price | MOQ |
| • “Search” ▶ |   |  ...  |       |            |       |     |
└──────────────┘   |  CTA buttons:  [Request Quote] [Compare]  |
                   └────────────────────────────────────────────┘
```
- **Compare drawer** shows up to 5 motors side-by-side.  
- **Request Quote** opens modal: choose qty ➜ confirm ➜ backend stores RFQ record.  
- **Custom Motor** tab auto-fills timeline & cost range, lets user submit specs PDF.

### 4.6 External Vendor Ingestion
- **Adapter pattern**: each vendor scraper normalises → `motors` table.
- Nightly cron + manual “Sync Now” in admin.

---

## 5. Non-Functional Requirements
| Area | Requirement |
| --- | --- |
| Performance | ≤3 s search latency @ 1k motors |
| Security | Margin vars in server env; role-based admin |
| Compliance | GDPR for user RFQ data; ITAR check on export markets |
| Availability | 99.5 % monthly uptime SLA |
| Internationalisation | USD & INR; metric & imperial inputs |

---

## 6. Interfaces

### 6.1 REST/GraphQL Endpoints (MVP)
| Method | Route | Purpose |
| --- | --- | --- |
| `POST /api/motors/search` | returns ranked list |
| `GET /api/motors/:id` | detail view |
| `POST /api/rfq` | create RFQ |
| `POST /api/custom-motor/estimate` | returns timeline & cost JSON |

*Auth:* JWT (users) & API key (internal services).

### 6.2 Admin Dashboard
- CRUD motors, bulk CSV upload
- Override price / lead-time
- Trigger vendor sync & see logs

---

## 7. Data Flow Diagram

```
[User] → form → /search → [Search Service]
                   ↑               ↓
      vendor sync →[DB: motors]← scrapers
```

---

## 8. Assumptions
1. Welkinrim margin = **30 %** default; handling on externals = **5 %**.  
2. Three launch vendors cover 80 % of queries.  
3. Custom motor NRE baseline = USD 10 k.  
4. No payment processing in MVP; RFQ triggers offline sales workflow.

---

## 9. Acceptance Criteria (abridged)
1. **REQ-1**: Submitting required fields returns ≥1 result 90 % of time on test set.  
2. **REQ-2**: Suitability score validated vs ground-truth picks (≥85 % match).  
3. **REQ-3**: Price shown to user does **not** leak margin in API response.  
4. **REQ-4**: Admin override changes are live in <10 min.  
5. **REQ-5**: Custom-motor estimate page sent via email in markdown template.

---

## 10. Milestones & Owners
| When | Deliverable | Owner |
| --- | --- | --- |
| Day 0-7 | DB schema + CSV import | Backend |
| Day 8-15 | Search endpoint + basic UI | Full-stack |
| Day 16-25 | Vendor scrapers v0.1 | Data Eng |
| Day 26-30 | MVP demo + QA | PM |
| Day 31-60 | Admin dashboard, compare drawer | Front-end |
| Day 61-90 | Custom motor flow, security hardening | All |

---

## 11. Open Questions
1. Should score weights be tunable in admin UI? (default hard-coded)
2. Need legal review on ITAR if exporting to US defence customers.

---

*End of document*
