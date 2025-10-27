# Fabric Integration Blueprint

## 1. Objectives
- Replace the bespoke canvas renderer with Fabric.js while preserving Dropple’s semantic model (frames, elements, metadata).
- Keep mode-specific UX (Graphics, UI/UX, Animation, etc.) by layering Dropple services on top of Fabric.
- Maintain compatibility with Dev Mode exports, AI pipelines, and existing persistence/history.

## 2. High-Level Architecture

### 2.1 Runtime Layers
| Layer | Responsibility | Notes |
| --- | --- | --- |
| UI Shell (React components) | Tool sidebar, inspector, overlays, modals | Existing components (`ToolSidebar`, `InspectorPanel`, overlays) remain; they call services instead of manipulating store directly. |
| Fabric Service | Owns Fabric canvas instance, object lifecycle, event wiring | New module encapsulating Fabric APIs; exposes helper methods and emits state changes. |
| Store Adapter | Keeps Zustand store (`useCanvasStore`) in sync with Fabric JSON | Handles import/export, selection, history, undo/redo. |
| Persistence / Export | Serialisation to Dropple JSON, Dev Mode code generation | Uses adapter to read canonical state; eventually migrates from custom schema to Fabric JSON + metadata. |

### 2.2 Module Breakdown
```
app/workspace/components/canvas/
├─ fabric/
│  ├─ FabricContext.tsx        (context provider, lazy-load Fabric, share singleton)
│  ├─ fabricService.ts         (imperative API: createFrame, createShape, updateProps, select, zoom)
│  ├─ fabricAdapters.ts        (Dropple <-> Fabric conversion helpers)
│  ├─ fabricEvents.ts          (wires Fabric events to store actions / history)
│  ├─ modePresets.ts           (per-mode configuration: tool availability, snapping, constraints)
│  └─ hooks/
│        ├─ useFabricCanvas.ts (setup lifecycle, viewport sync)
│        └─ useFabricTools.ts  (binds sidebar tools/actions to service)
```

## 3. Data Model & Synchronisation
- **Canonical Source**: Fabric Canvas (objects carry `droppleId`, `droppleType`, metadata).
- **Serialization**: Store `fabricCanvas.toJSON(customProperties)` + Dropple-specific metadata (component type, AI tags). Provide migrations for existing projects (legacy element schema → Fabric objects).
- **State Bridge**:
  - Fabric events (object:modified, object:added, selection:created, history) invoke adapter callbacks.
  - Adapter updates Zustand store for UI consumers (selection lists, frame lists, inspector).
  - Store-driven changes (e.g., inspector slider) call Fabric service methods (`updateProps`), not direct state mutation.
- **History**: Wrap Fabric changes in existing `pushHistoryState` to keep undo/redo working. Optionally leverage `fabric.Canvas` `historyUndo`/`historyRedo` via extension later.

## 4. Mode Strategy
- **Graphics & Image (Phase 1)**: Full Fabric rendering (frames + elements). Enable drawing tools, text, images, filters.
- **UI/UX (Phase 2)**: Add snapping, constraints, component metadata, hotkeys. Bridge auto-layout and prototype links.
- **Animation (Phase 3)**: Layer timeline overlay; use Fabric objects for keyframe states, integrate with `TimelineBar`.
- **Podcast (Phase 4)**: Limited Fabric interactions; focus on annotations/visual overlays while timeline remains separate.
- **Remaining Modes**: Dev, Docs, Brand adopt Fabric for visual regions while retaining mode-specific side panels.

## 5. Tooling Integration
- **Tool Sidebar**:
  - Tool definitions map to Fabric service actions (`createFrame`, `createRect`, `createText`, `createImage`).
  - Pointer tool delegates to Fabric selection; panning uses Fabric viewport transforms.
- **Inspector Panel**:
  - Reads properties from selected Fabric object (position, size, fill, typography).
  - Updates via service methods, which emit Fabric changes and sync store.
  - Export/Code buttons call Fabric serialization, then pipeline into Dev Mode generators.
- **Context Menu / Shortcuts**: Migrate to Fabric operations (group, send to front/back, duplicate).

## 6. Export & AI Considerations
- Attach semantic metadata to Fabric objects (e.g., `droppleComponent`, `accessibilityRole`, `dataBindings`).
- Dev Mode export reads from Fabric JSON + metadata map to generate code (React, HTML, etc.).
- AI tools (copy generation, layout suggestions) operate on Fabric JSON; they can inject or mutate objects via service API.

## 7. Rollout Checklist
1. **Fabric Adapter Foundation**
   - [ ] FabricContext + service skeleton
   - [ ] Sync frames/elements → Fabric objects
   - [ ] Persist Fabric JSON into store (prototype branch)
2. **Tool Rewire**
   - [ ] Pointer, shape, frame, text, image tools call Fabric service
   - [ ] Image upload pipeline updates Fabric image objects
3. **Inspector Bridge**
   - [ ] Size/position sliders mutate Fabric
   - [ ] Style panels (fill, opacity, stroke) update Fabric
   - [ ] Typography + text editors
4. **History & Selection**
   - [ ] Hook Fabric events into history stack
   - [ ] Ensure multi-select, marquee, grouping ported
5. **Export / AI**
   - [ ] Define metadata schema on Fabric objects
   - [ ] Update Dev Mode exporters to read new schema
6. **Mode Migration**
   - [ ] Graphics GA
   - [ ] Image mode enablement
   - [ ] UI/UX with constraints & prototype links
   - [ ] Animation timeline integration
   - [ ] Remaining modes
7. **Cleanup**
   - [ ] Remove legacy renderer (CanvasLayer, ElementNode, FrameNode)
   - [ ] Archive unused store fields

## 8. Risks & Mitigations
- **Bundle Size**: Lazy-load Fabric via dynamic import; split per mode if necessary.
- **Performance**: Monitor object count; leverage Fabric object caching and requestRender throttling.
- **Schema Divergence**: Keep migration utilities for legacy projects; maintain docs for plugin developers.
- **Undo/Redo Drift**: Build unit tests around adapter to ensure Fabric ↔ Store parity.

## 9. Immediate Next Sprint
- Implement Fabric service + adapter scaffolding.
- Load Dropple frame/element data into Fabric (Graphics mode).
- Replace sidebar creation tools with Fabric-powered actions.

