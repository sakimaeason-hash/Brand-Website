# Wheelchair specification data quality

The normalized records preserve selected rule-relevant workbook evidence in `source.raw` and use the metric values listed below as authoritative inputs. US customary values shown by the product experience must be derived from those metric inputs. A conflict or missing value is carried in `source.status`; it must not be replaced with an estimate.

## Source registry

| File | Sheet | Received | Reviewed | SHA-256 |
| --- | --- | --- | --- | --- |
| `孵化四部产品全线表（Parameters of all the products）.xlsx` | `电动轮椅Wheelchair` | 2026-08-05 | 2026-08-05 | `6EAFAFBF61DDCD8D0D3146B5726A7093410BCFEB19244EA5AFCACF7C48C14E00` |

The runtime catalog retains normalized values, rule-relevant raw evidence, and workbook column references. The complete external workbook remains the source of truth; the runtime catalog does not claim to preserve every workbook field.

| Storefront product | SKU | Workbook columns | Authoritative metric fields | Conflicts | Missing critical values | Affected rule | UI treatment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Travel Air W 03 | GI03H102, GI04H103, GI05H104, GI06H105 | I, J, K, L | 440 mm seat width; 420 mm seat depth; 15 kg net weight without battery; 340 x 540 x 840 mm folded dimensions; 25.2 V, 10 Ah battery | None recorded | None recorded | Seat fit, lifting, storage, and airline battery checks | Show normalized values and retain each SKU's raw packed weight. A 25.2 V x 10 Ah battery derives to 252 Wh. |
| Travel Air W 21 | PA22V100 | P | 460 mm seat width; 480 mm seat depth; 16.2 kg net weight without battery; 390 x 550 x 793 mm folded dimensions; 10 Ah battery capacity | None recorded | `battery.voltageV` | Airline verification | Show battery voltage as unavailable and do not label the product airline-verified until a verified voltage is provided. Preserve the raw `10 Ah; voltage absent` value. |
| Travel Air W 26 | PA26A000, PA26B000 | Q, R | 410 mm seat width; 460 mm seat depth; 550 x 350 x 850 mm folded dimensions; 6 Ah battery capacity | None recorded | `battery.voltageV` | Airline verification | Show battery voltage as unavailable and do not label either SKU airline-verified until a verified voltage is provided. Preserve the raw `6 Ah; voltage absent` value. |
| Power Max 01 | GI01H100, GI02H101 | D, C | 480 mm seat width and depth; SKU-specific overall and folded dimensions; 24 V, 25 Ah battery | None recorded | None recorded | Seat fit, storage, range, and airline battery checks | Show SKU-specific dimensions. Manufacturer airplane flag is false, so do not present airline verification. |
| Power Max 16 | PA16H100, PA16L100, PA16K100 | E, F, G | 500 mm seat width; 470 mm seat depth; 500 mm armrest spacing; 1,200 mm turning radius; SKU-specific cushion, battery, and range values | PA16K100 lists a 420 mm cushion width against a 500 mm seat width. The workbook's 42.2 in turning-radius text is inconsistent with the authoritative 1,200 mm value; derive 47.2 in. | None recorded | Hard seat-width fit, cushion-fit warning, maneuvering, lifting, and range | Use verified seat width and armrest spacing for the hard width rule. Show a caution for PA16K100 and never hide its raw 420 mm cushion width. Display 47.2 in when using US units, not 42.2 in. |
| Spacious Pro 15 | PA15F100, PA15B100 | V, W | 550 mm seat width; 470 mm seat depth; 460 mm cushion width; 730 x 360 x 750 mm folded dimensions | The 460 mm cushion width is materially narrower than the 550 mm seat and armrest spacing. The workbook's 154.6 in folded-width text is invalid; 360 mm is authoritative and derives to 14.2 in. | Battery voltage is not available, but the manufacturer airplane flag is false and the chemistry is lead-acid. | Hard seat-width fit, cushion-fit warning, storage, and airline battery checks | Show a fit warning and never hide the raw 460 mm cushion width. Display 14.2 in folded width when using US units, not 154.6 in. Do not present airline verification. |
| Basic 13 | PA13A100, PA13L100, PA13N100 | S, T, U | 480 mm seat width; 440 mm seat depth; 380 mm seat-to-footrest distance; 29 kg net weight excluding battery | The workbook's 18.9 in seat-to-footrest text conflicts with the authoritative 380 mm value; derive 15.0 in. | `batteryWeightKg` | Footrest fit and lifting suitability | Display 15.0 in when using US units, not 18.9 in. Because the non-removable battery weight is missing, suppress lifting suitability whenever the user supplies a lifting limit; show that critical weight data is unavailable. |

## Decision rules

- `manufacturerAirplaneFlag: true` is not enough to establish airline verification when battery voltage is missing. W21/PA22 and W26/PA26 must remain unverified until voltage is supplied and watt-hours can be derived.
- A16 maneuvering uses the authoritative 1,200 mm turning radius, which derives to 47.2 in. The conflicting 42.2 in workbook text is not used for evaluation.
- PA15 storage evaluation uses the authoritative 360 mm folded width, which derives to 14.2 in. The invalid 154.6 in workbook text is not used.
- PA13 footrest evaluation uses the authoritative 380 mm seat-to-footrest distance, which derives to 15.0 in. The conflicting 18.9 in workbook text is not used.
- PA15 and PA16K cushion-width differences remain visible as warnings. Their raw values must always remain available to the UI and audit trail.
- Basic 13 has a non-removable battery and no verified battery weight. If a user provides a lifting limit, lifting suitability is suppressed rather than inferred from net weight alone.
