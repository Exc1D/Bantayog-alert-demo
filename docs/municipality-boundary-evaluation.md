# Municipality Boundary & Report-Segregation Accuracy Evaluation

This evaluation checks whether the current municipality polygons can reliably sort report locations into the correct municipality.

## Scope

- Boundary source under test: `src/data/camarines-norte-boundaries.json`
- Municipality assignment logic under test: `src/utils/geoFencing.js` (`detectMunicipality`)
- Municipality reference points checked: `MUNICIPALITY_COORDS` from `src/utils/constants.js`

## Method

A repeatable script (`scripts/evaluateMunicipalityBoundaries.mjs`) performs:

1. **Structural checks** on all 12 polygons (closed rings, vertex counts).
2. **Grid sampling checks** across the boundary dataset bbox:
   - points not in any municipality polygon,
   - points in multiple municipality polygons (overlap conflict).
3. **Municipality coordinate checks**: verifies if each municipality reference point maps back to its own municipality.

## Key Results

From `docs/municipality-boundary-evaluation.json`:

- Features found: **12** (all expected municipalities present).
- Grid sample points: **67,600**.
- **Overlap ratio:** `11.24%` of sampled points fall inside *multiple* municipalities.
- **Uncovered ratio:** `52.66%` of sampled points fall in *no* municipality polygon.
- **Reference-point match rate:** `12 / 12` municipalities correctly self-identify from their own reference coordinates after overlap tie-break improvements.

### Municipality reference-point consistency

All 12 municipality reference coordinates now resolve to their own municipality using the same tie-break logic used by report submission.

### Highest-overlap municipality pairs (sample-count based)

1. Jose Panganiban | Paracale (`1729`)
2. Labo | San Lorenzo Ruiz (`1707`)
3. San Lorenzo Ruiz | San Vicente (`1538`)
4. Labo | San Vicente (`1315`)
5. Daet | Mercedes (`1312`)

## Assessment

The current polygons are **not accurate enough** for dependable municipality-based report segregation:

- High polygon overlap means a point can logically belong to multiple municipalities, and requires deterministic tie-break logic to avoid ambiguity.
- Even with tie-break improvements, overlap and coverage quality still indicate the boundary dataset is highly simplified versus authoritative administrative boundaries.
- Large uncovered portions suggest simplified/non-contiguous polygon coverage inside the dataset bbox.

## Impact on report sorting

Current report sorting can be incorrect because municipality assignment is done by `detectMunicipality` and saved as `location.municipality` when submitting reports. If assignment is wrong at ingestion, downstream admin filters and map/feed filters inherit the wrong municipality.

## Recommended next step

Replace `src/data/camarines-norte-boundaries.json` with authoritative municipal boundary GeoJSON (e.g., official Philippine administrative boundary dataset), then re-run:

```bash
node scripts/evaluateMunicipalityBoundaries.mjs
```

Target acceptance criteria:

- Near-zero overlap ratio between municipalities
- Near-zero uncovered ratio within intended province mask
- 12/12 municipality coordinate self-match


## Maslog-specific concern (Basud vs San Lorenzo Ruiz)

To address the reported misclassification for Maslog:

- `detectMunicipality` now resolves polygon overlaps by evaluating all matching municipalities instead of returning the first match.
- It applies an explicit barangay override for `Maslog -> San Lorenzo Ruiz` when that barangay is provided.
- If multiple polygons still match, it falls back to the nearest municipality reference point among the overlapping candidates.

The evaluation JSON now includes `overlapTieBreakCheck`, showing an overlap sample where Basud and San Lorenzo Ruiz both contain the point; with the new tie-break logic, the selected municipality is San Lorenzo Ruiz.
