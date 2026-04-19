

## Plan: Model-Specific Transmission and Engine Filtering

### What changes

**1. Add data mappings in `src/data/mockCarData.ts`:**
- `modelTransmissions`: Record mapping each model to its available transmissions (e.g., `'ZS EV': ['Automatic']`, `Bolero: ['Manual']`, `Creta: ['Manual', 'Automatic']`). Electric models get `['Automatic']` only.
- `modelEngines`: Record mapping each model to its available engine sizes (e.g., `Swift: ['1.2']`, `Fortuner: ['2.7', '3.0']`, `'ZS EV': ['Electric']`). Electric models show `['Electric']` instead of liter values.
- Export both new mappings.

**2. Update `src/components/PriceInputForm.tsx`:**
- Import the two new mappings.
- Derive `availableTransmissions` and `availableEngines` from the selected model (fall back to full list if no model selected).
- When fuel type is `Electric`, force transmission to `Automatic` and engine to `Electric`.
- Reset transmission/engine in `handleModelChange` if the current selection is no longer valid.
- Update the Transmission and Engine dropdowns to use the filtered lists.

### Behavior summary
- Select a model → Transmission dropdown shows only what that model supports
- Select a model → Engine dropdown shows only the actual engine options for that model
- If fuel = Electric → Transmission auto-set to Automatic, Engine shows "Electric"
- Changing model resets invalid selections

