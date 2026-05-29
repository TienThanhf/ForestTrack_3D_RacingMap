# AGENTS.md — Low-Poly Forest Racing Track 3D

## Mission

Build a course-sized **Computer Graphics** project using **Three.js**, **WebGLRenderer**, **Vite**, and **vanilla JavaScript**. The product is a stylized low-poly forest racing map with Explore/Race modes and Day/Night modes.

Follow the project roadmap in `README.md`. Implement only the requested phase in each task unless explicitly instructed otherwise.

## Non-Negotiable Product Requirements

The final application must demonstrate:

1. Basic primitives: box, sphere, cone, cylinder, wheel, Utah teapot, and at least one additional constructed form.
2. At least one externally loaded `.glb` or `.gltf` model, planned as the player car.
3. Three visual representations for generated objects: Solid, Lines, and Points.
4. Perspective camera controls exposing `fov`, `near`, and `far`.
5. Affine transformation controls: translation, rotation, and scale for selectable objects.
6. Lighting with visible light sources and shadows.
7. Bitmap texture mapping, including user selection of an image to apply to an object.
8. Animation, including vehicle movement and rotating wheels.
9. Explore Mode with elevated `OrbitControls` camera.
10. Race Mode with keyboard driving and smooth third-person follow camera.
11. Day Mode and Night Mode.

Do not sacrifice these rubric requirements for extra game mechanics.

## Visual Constraints

- Match a cheerful low-poly/cartoon forest racing-track style.
- Target composition: green terrain, winding charcoal track, red/yellow curbs, white barriers, pine trees, small pit shelter, compact stylized car.
- Prefer readable flat shapes and stable performance over high-detail realism.
- Use strong daylight shadows and a clearly distinct lamp-lit night view.
- Recreate the style; do not copy unlicensed external assets.

## Technical Stack and Constraints

- Use `three` with `WebGLRenderer`.
- Use Vite and ES modules.
- Use vanilla JavaScript; do not add React, Vue, TypeScript, or another UI framework.
- Use Three.js addons such as `OrbitControls`, `GLTFLoader`, and `TeapotGeometry` where needed.
- A small control panel may use `lil-gui`; do not add a large UI dependency without explicit permission.
- Do not introduce `cannon-es`, another physics engine, shaders, postprocessing, multiplayer, AI opponents, or lap systems before the core rubric phases are complete.
- Implement simple kinematic movement/collision first. Physics is optional bonus work only after a stable rubric-complete build.

## Phase Discipline

Before editing:

1. Read `README.md` and this file.
2. Identify the requested phase and list the exact affected files.
3. Inspect existing source files before creating replacements.
4. Avoid implementing features assigned to later phases.

During editing:

- Keep changes scoped to the requested phase.
- Prefer small, named modules over a monolithic `main.js`.
- Do not create empty placeholder modules for future phases unless necessary for current code.
- Preserve public APIs created in earlier phases unless a change is explicitly justified.
- When a phase changes architecture, explain the change in the task summary and update documentation if necessary.

After editing:

1. Run the relevant validation commands.
2. Resolve build/runtime issues caused by the changes.
3. Report files changed, what was implemented, commands run, and any remaining manual asset steps.
4. Do not claim visual or runtime success unless it was actually verified.

## Planned Architecture Boundaries

Use these boundaries as the project grows; add files when their feature phase begins:

- `src/core/`: renderer, camera, scene lifecycle, shared asset loading.
- `src/world/`: static world generation such as ground, track, curbs, barriers, forest, pit.
- `src/objects/`: reusable interactive or notable scene objects such as car, lamp, teapot.
- `src/systems/`: behavior spanning objects, including lighting, environment state, rendering mode, transformations, textures, driving, collision.
- `src/ui/`: user-facing mode switches and graphics demonstration controls.
- `public/models/`: imported GLB/GLTF models only.
- `public/textures/`: credited bitmap texture assets only.

## Code Quality Rules

- Use descriptive English identifiers and module names.
- Keep comments focused on non-obvious geometry/math or design decisions; do not narrate straightforward code.
- Avoid magic numbers: group map dimensions, track width, camera presets, lighting values, and colors as named constants or configuration values.
- Dispose of replaced textures/geometries/materials where runtime replacement occurs.
- Handle asset-loading failure gracefully, especially the player car GLB: use or retain a primitive fallback.
- Ensure resize handling updates renderer dimensions and camera aspect/projection.
- Avoid unnecessarily high segment counts, texture sizes, light counts, or shadow settings.

## Graphics-Specific Rules

- Generated primitive objects must be available for the Solid/Lines/Points demonstration.
- Do not rely on imported GLB meshes as the only evidence for primitive construction.
- Track generation must expose reusable curve/path information for placing curbs, barriers and vehicle movement.
- Shadow casting should be selective for performance; important objects cast shadows and terrain/track receive shadows.
- Day/Night switching must manage lighting and emissive elements coherently, not merely change background color.
- Perspective control changes must call `camera.updateProjectionMatrix()`.
- Texture upload/mapping must validate file input and avoid breaking the scene when no image is selected.

## Interaction Rules

- Explore Mode is the graphics-inspection and demo mode. It may expose UI for object selection, transforms, camera projection and render modes.
- Race Mode owns `W/A/S/D` and arrow keys for car input.
- Do not assign conflicting keyboard actions between Explore and Race modes.
- The follow camera should interpolate smoothly rather than rigidly snapping every frame.
- Mode changes must leave the application in a valid state and restore appropriate controls.

## Assets and Licenses

- Do not download, embed, or commit external assets unless the task explicitly asks for it or the user supplies them.
- For any external model or texture added, update `README.md` asset credits with source and license.
- Prefer placeholders or procedural geometry until approved low-poly assets are available.

## Required Verification

Once project tooling exists, run before finishing each coding task:

```bash
npm run build
```

When a phase includes user interaction or scene appearance, also run the development server and manually check the relevant behavior when the environment allows it.

Do not hide build errors, console errors, missing-asset errors, or unverified visual assumptions.

## Git and File Safety

- Do not delete user assets or overwrite unrelated files.
- Do not run destructive Git commands such as `git reset --hard`, `git clean -fd`, force pushes, or history rewriting unless explicitly requested.
- Do not edit files outside this repository.
- Do not commit secrets, tokens, local absolute paths, generated build output, or large unapproved assets.
- Keep `node_modules/`, `dist/`, environment files and local editor files out of version control through `.gitignore`.

## Phase 0 Scope Lock

When asked to implement **Phase 0**, implement only:

- Vite + vanilla JavaScript project initialization;
- Three.js dependency setup;
- minimal clean source/module structure;
- one working renderer/scene/camera baseline;
- responsive resize behavior;
- baseline styling;
- repository `.gitignore`;
- preservation or addition of `README.md` and `AGENTS.md`;
- build verification.

Phase 0 must **not** add:

- race track geometry;
- trees, curbs, barriers, pit area or car;
- GUI panels;
- model/texture assets;
- race controls;
- day/night logic;
- render-mode system;
- physics or collision.
