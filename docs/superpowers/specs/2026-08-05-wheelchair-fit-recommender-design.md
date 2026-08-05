# Wheelchair Fit Recommender Design

**Date:** 2026-08-05
**Status:** Approved in conversation; awaiting written-spec review
**Scope:** GoldSeason powered wheelchairs only; architecture prepared for future mobility-scooter support

## 1. Purpose

Build a self-service wheelchair selection experience that recommends one to three existing GoldSeason powered wheelchair products from a user's body measurements and intended use scenarios. The experience should reduce repetitive customer-service work while remaining explainable, conservative, and adaptable to different environments.

This feature is a shopping and product-screening aid. It is not a clinical seating assessment and must not represent itself as a substitute for individual assessment, fitting, training, or follow-up by trained personnel.

## 2. Confirmed product and business decisions

- Entry point: a prominent **Find My Wheelchair** action at the top of the Products page.
- Destination: a dedicated `/wheelchair-finder` multi-step flow.
- First release: powered wheelchairs only.
- Result: recommend one to three current products with fit reasons, limitations, comparison, and purchase actions.
- Authentication: no sign-in is required to complete the assessment; signed-in users may explicitly save a result.
- Units: US units (`in`, `lb`) by default, with a `cm`, `kg` toggle.
- Matching approach: deterministic rules with hard safety filters followed by weighted scenario scoring.
- Product source of truth: the supplied official product specification workbook.
- Data conflicts: when metric and imperial values conflict inside the workbook, preserve the raw values, use the metric value as authoritative, and derive the imperial value programmatically.
- Safety: never force a recommendation when hard constraints fail.
- Escalation: when automated matching is inappropriate, explain why and direct the user to remeasure or consult an OT/ATP or other qualified professional.

## 3. Product mapping

The current storefront names map to official models or SKUs as follows:

| Storefront product | Official model or SKU family |
| --- | --- |
| Travel Air W03 | ND03-C/D/E/F; GI03H102/GI04H103/GI05H104/GI06H105 |
| Travel Air W21 | PA22V100; HE702 family |
| Travel Air W26 | L-41; PA26A000/PA26B000 |
| Power Max 01 | YKW01-A/YKW01-B; GI01H100/GI02H101 |
| Power Max 16 | XSW001-B (A16); PA16H100/PA16L100/PA16K100 |
| Basic 13 | JL100W-01A; PA13A100/PA13L100/PA13N100 |
| Spacious Pro 15 | XSW003-D; PA15F100/PA15B100 |

The implementation must centralize these records so that the Products page, comparison UI, and recommender cannot drift apart.

## 4. User journey

### 4.1 Entry and introduction

The Products page presents **Find My Wheelchair** above the product grid. The finder opens with a short explanation of what it can and cannot determine, estimated completion time, privacy behavior, and the ability to switch units.

### 4.2 Assessment steps

1. **Basic information**
   - Height
   - Weight
   - Unit preference

2. **Safety screen**
   - Pressure-injury or pressure-sore concern
   - Significant postural asymmetry
   - Need for custom positioning, specialized supports, or clinical seating
   - Any positive high-risk response ends automatic product matching and shows a professional-assessment pathway.

3. **Body fit**
   - Quick mode: height, weight, and general body-build selection. Results are labeled preliminary.
   - Precision mode: hip width, buttock-to-back-of-knee length, and lower-leg length. Results may be labeled higher confidence when the required product data is verified.
   - Every measurement includes a realistic photo, plain-language instructions, equipment guidance, and common-error warnings.

4. **Use scenarios**
   - Indoor, outdoor, or mixed use
   - Typical surfaces and obstacles
   - Maneuvering in tight spaces
   - Required daily range
   - Airline travel
   - Vehicle/trunk storage dimensions when known
   - Maximum weight the user or caregiver can lift
   - Priorities such as portability, roominess, range, and rough-surface capability

5. **Results**
   - One to three eligible products
   - Match band and confidence level
   - Traceable fit reasons
   - Important limitations and unresolved data
   - Side-by-side comparison
   - Purchase action
   - Remeasure and edit-scenario actions

### 4.3 Persistence

- Anonymous progress and results remain in the browser and can be resumed.
- Saving to an account is explicit, not automatic.
- Saved assessments include measurements, use preferences, result snapshot, product-data version, and rules version.
- Do not persist individual pressure-injury, posture, or other sensitive screening answers. A saved record may state only that automated recommendation was unavailable.

## 5. Recommendation model

### 5.1 Canonical units and traceability

All calculations use canonical numeric values. Metric workbook values are normalized first; US display values are derived from them. Each normalized field retains:

- the original workbook text;
- normalized numeric value and unit;
- source product, variant, and field;
- verification status (`verified`, `conflicting`, or `missing`);
- product-data version and correction note when applicable.

No recommendation rule may parse free-form marketing copy at runtime.

### 5.2 Hard exclusions

A product is ineligible when any applicable hard condition fails:

- user weight exceeds rated capacity;
- verified effective seat width is narrower than measured hip width;
- seat depth would prevent safe knee clearance or provide materially inadequate thigh support;
- fixed seat-to-footrest geometry is incompatible with the measured lower-leg length;
- folded dimensions exceed user-provided storage limits;
- airline travel is required but the battery and transport data cannot pass the travel-verification rule;
- a high-risk safety-screen response requires professional assessment;
- a critical product field required for the user's selected scenario is missing or conflicting.

Soft preferences may never override a hard exclusion.

### 5.3 Measurement rules

The precision flow uses a configurable and auditable measurement-rule table. The initial logic follows wheelchair-measurement guidance:

- target seat width is based on measured hip width or the relevant effective spacing between supports;
- target seat depth is buttock-to-back-of-knee measurement minus approximately 30–50 mm;
- lower-leg length maps to the seat/cushion surface-to-footrest distance.

Rule tolerances and caution bands must live in configuration, be covered by boundary tests, and be changeable without rewriting the questionnaire.

### 5.4 Scenario score

Products that pass every hard rule receive a 100-point scenario score:

| Dimension | Weight |
| --- | ---: |
| Body and seating fit | 45 |
| Indoor/outdoor environment | 25 |
| Folding, lifting, vehicle storage, and travel | 20 |
| Range, speed, and comfort preferences | 10 |

Initial output bands are configurable. The UI uses plain labels such as **Best match**, **Good match**, and **Potential match**, never a clinical guarantee. Low-scoring products remain hidden.

Quick mode cannot produce the highest confidence level because critical measurements are absent. Missing or conflicting product data also caps confidence.

### 5.5 Airline handling

The workbook's airline field is an input, not a guarantee. The rule considers:

- battery chemistry;
- whether it is designed to be removed;
- volts, amp-hours, and calculated watt-hours where available;
- manufacturer verification status;
- the user's airline-travel requirement.

If watt-hours or other critical transport data is missing, the product cannot be labeled airline verified. The result instead instructs the customer to confirm with the airline. Airlines may impose rules stricter than general FAA allowances.

## 6. Product data model

Each storefront product owns one or more variants and four structured data groups:

1. **Fit**
   - rated capacity
   - seat width and depth
   - cushion width and depth
   - effective armrest spacing
   - seat height
   - seat-to-footrest distance and adjustability
   - backrest dimensions when relevant

2. **Mobility**
   - overall dimensions
   - turning radius
   - wheel sizes and tire type
   - obstacle-climbing height
   - maximum speed
   - range

3. **Transport**
   - net weight excluding battery
   - battery weight and calculated transport weight
   - folded dimensions
   - battery removability, chemistry, voltage, amp-hours, and watt-hours
   - airline-verification status

4. **Governance**
   - official raw values
   - normalized values
   - verification status
   - source and correction note
   - data version

Critical conflicts remain visible in a data-quality report. The system must not silently guess or replace an unresolved critical value.

## 7. Architecture

### 7.1 Central catalog

Replace the duplicated/hard-coded product specifications with a typed central catalog consumed by:

- Products page cards;
- finder rule engine;
- result comparison;
- account-saved assessment display.

The first release can use a version-controlled data module because there are only seven storefront products. Its structure must allow a future database or CMS adapter without changing the rule engine.

### 7.2 Pure rule engine

The recommendation engine is a side-effect-free module:

- input: normalized assessment, normalized product catalog, rules version;
- output: eligibility decision, exclusion reasons, score components, confidence, warnings, and ranked products.

It must not depend on React components, database calls, an AI service, or mutable global state. This makes every decision reproducible and testable.

### 7.3 Application surfaces

- `/products`: entry button and corrected official product facts.
- `/wheelchair-finder`: questionnaire and results flow.
- account area: saved assessment list and result snapshot.
- server endpoint or action: authenticated save/read/delete only.

### 7.4 Future scooter expansion

The domain model distinguishes shared constraints from wheelchair-only and scooter-only questions. Scooter products and rules stay disabled in the first release, but adding them should not require rewriting product persistence, scoring output, or result comparison.

## 8. Self-service and support reduction

- Explain why each question is asked.
- Validate values immediately and guard against likely unit-entry mistakes.
- Provide measurement photos, text guidance, and common-error callouts.
- Save progress locally and allow users to resume.
- Explain why each recommended product passed and why other products failed.
- Allow users to remeasure and change scenarios without restarting.
- If only soft preferences conflict, show which preference can be relaxed and recompute immediately.
- Never suggest relaxing a hard safety rule.
- Offer an optional assessment-summary identifier for escalated support. It contains measurements, scenario preferences, and rule reasons but no sensitive safety-screen answers.

## 9. Empty, error, and no-match states

1. **Professional assessment required**
   - No products are ranked.
   - Explain the limitation without diagnosing.
   - Recommend consultation with an OT/ATP or other qualified professional.

2. **Incomplete measurement**
   - Identify the missing measurement.
   - Link directly to the relevant guided step.

3. **No product meets hard constraints**
   - Show the failed constraints and required product characteristics.
   - Do not show a closest product as suitable.

4. **Soft preferences conflict**
   - Preserve all safety filters.
   - Offer explicit preference changes and preview their effect.

5. **Product data unavailable or conflicting**
   - Lower confidence or suppress the affected product, depending on whether the field is critical to the assessment.
   - Never substitute a marketing claim for missing official data.

## 10. Accessibility and content

- Target WCAG 2.2 AA.
- Complete keyboard operation and visible focus states.
- Correct labels, error associations, announcements, and step semantics for screen readers.
- Large touch targets and readable default text sizes.
- Status communicated through text and icons, not color alone.
- Plain US English, with inches/pounds as the default display.
- Range, airline, and fit claims include clear limitations.
- Measurement imagery should be realistic, respectful, and show common US home and travel contexts.

## 11. Verification and acceptance

### 11.1 Data validation

- All seven storefront products map to an official model/SKU family.
- Required numeric fields carry units and provenance.
- Metric values are authoritative when workbook unit strings conflict.
- Derived imperial values are tested against conversion tolerances.
- Missing and conflicting critical fields are visible in a report and cannot silently enter high-confidence matching.

### 11.2 Automated rule tests

- capacity boundaries;
- seat-width and seat-depth boundaries;
- lower-leg/footrest compatibility;
- metric/US unit equivalence;
- airline battery calculation and missing-data behavior;
- folded-dimension and lifting constraints;
- hard-filter precedence over scores;
- score ordering and deterministic tie handling;
- quick-mode confidence cap;
- no-match and professional-assessment outcomes.

### 11.3 Scenario test matrix

Test representative users and environments including:

- small and large body dimensions;
- high user weight and near-capacity cases;
- narrow indoor spaces;
- mixed indoor/outdoor use;
- uneven outdoor surfaces;
- airline travel;
- small vehicle storage;
- limited caregiver lifting capacity;
- high daily range requirement;
- conflicting preferences;
- missing measurements and high-risk safety answers.

For every case, a reviewer must be able to trace the result to exact product facts and configured rules.

### 11.4 End-to-end and accessibility tests

- anonymous start, resume, completion, and reset;
- unit switching without value corruption;
- quick and precision flows;
- signed-in save, view, and delete;
- mobile and desktop layouts;
- keyboard-only completion;
- screen-reader labels and error announcements;
- purchase links and product comparison;
- corrected product-card specifications.

### 11.5 Launch measurements

Track only non-sensitive analytics events:

- assessment starts and completions;
- step drop-off;
- measurement-help usage;
- no-match reason category;
- comparison and purchase clicks;
- assessment-related support contacts per 100 completions;
- fit- or scenario-related return reasons when available.

Do not send body measurements or safety-screen answers to analytics.

## 12. Non-goals for the first release

- Clinical diagnosis or medical advice
- Custom seating prescriptions
- AI-generated eligibility decisions
- Mobility-scooter recommendations
- Automatic airline approval guarantees
- An admin/CMS editing interface
- Payment-channel changes

## 13. Source references

- Official workbook: `孵化四部产品全线表（Parameters of all the products）.xlsx`, sheet `电动轮椅Wheelchair`, received 2026-08-05.
- WHO, *Wheelchair provision guidelines* (2023): https://www.who.int/publications/i/item/9789240074521
- WHO, *Wheelchair Service Training Package – Intermediate Level*: https://iris.who.int/bitstream/10665/85776/4/9789241505765_eng_refmanual.pdf?ua=1
- FAA, *PackSafe – Wheelchairs and Mobility Devices*: https://www.faa.gov/hazmat/packsafe/wheelchairs-mobility-devices
