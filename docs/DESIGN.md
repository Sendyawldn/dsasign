# Design Intent and Product Personality

DSASign should feel like a chain-of-custody workbench for digital signatures, not a generic dashboard. The interface should make the document, the key material, and the verification result feel like evidence moving through a sealed workflow.

## Audience and Use-Context Signals

The main users are a signer who generates and uses keys and a verifier who checks a document against a signature. The app is used in short focused sessions, often while following the math step by step for a class, presentation, or demo.

## Visual Direction and Distinctive Moves

The visual anchor is a tamper-evident evidence dossier, translated into a digital ledger rather than literal prop styling. The first viewport should show three things immediately: document state, cryptographic key state, and verification state.

The signature motion should feel like a seal being pressed and confirmed: state changes should resolve decisively, not drift. Success should land with a short, authoritative transition; failure should feel like a broken seal or rejected check.

Typography should split roles clearly. Use a readable sans-serif for explanations and interface copy, and a monospace track for hashes, primes, and parameters so the math reads like evidence.

## Color, Typography, Spacing, and Density Decisions

Use a light archive surface with deep ink text, a restrained green for valid states, an amber for warnings and in-progress states, and a red for invalid states. Avoid purple-blue gradients, dark-slate defaults, and decorative glow backgrounds.

Keep spacing disciplined and ledger-like. Use an 8px base grid with larger jumps only where the flow needs separation between phases. Density should be moderate; the app needs enough room for equations and file states without turning into a dense data table.

## Token Architecture and Alias Strategy

Semantic roles should drive component tokens. Surface, border, focus, success, warning, and error roles should be explicit. Exact primitive values can stay flexible, but the role meanings should remain stable across pages.

## Responsive Recomposition Plan

Mobile should prioritize the current action and collapse supporting explanation into stacked sections. Tablet should regroup the three flows into a clear progression rather than a shrunken desktop. Desktop can expose more math and context side by side, but it should still read as a guided workflow, not admin chrome.

## Motion, Interaction, and Feedback Rules

Use motion only where it clarifies state changes: loading, success, invalid, and file replacement. Keep transitions short, use transform and opacity, and respect reduced-motion preferences. Every submit action should return a visible result and a textual explanation.

## Component Language, States, and Morphology

Prefer panels, key readouts, and evidence strips over repetitive KPI cards. Inputs should feel like form tools, not marketing fields. The page should distinguish default, hover, focus-visible, active, disabled, loading, empty, error, success, and transition states.

## Source Boundaries and Context Hygiene

The current product brief, repo evidence, and design intent are the only sources for UI decisions. Old screenshots, memory residue, and generic app templates should not steer the final composition.

## Accessibility Non-Negotiables

WCAG 2.2 AA is the hard floor. Focus states must be obvious, text contrast must remain clear, and status messages must be readable by assistive technology. File upload flows must be keyboard usable and should not rely on color alone.

## Anti-Patterns to Avoid

Do not ship a generic dashboard shell, decorative grid wallpaper, placeholder copy, or a static hero with swapped colors. Do not make the document workflow feel like a SaaS admin panel.

## Implementation Notes for Future UI Tasks

Keep the landing page lightweight and use the three feature routes as the main navigation. Reuse shared primitives for buttons, cards, inputs, labels, tabs, and toast feedback. Record intermediate math in the API responses so the UI can present an education mode without recomputing the core algorithm in the browser.
