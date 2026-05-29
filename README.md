# Low-Poly Forest Racing Track 3D

A course project for **Computer Graphics** built with **Three.js** and **WebGLRenderer**. The project recreates a stylized low-poly racing map in a forest environment: a curved asphalt circuit, red/yellow curbs, white guard barriers, pine trees, a small pit area, and a controllable low-poly car.

## Project Objective

Build an interactive 3D scene that demonstrates the core computer graphics requirements of the course:

- geometric modeling from basic primitives;
- perspective projection and camera control;
- affine transformations;
- lighting and cast/receive shadows;
- bitmap texture mapping;
- model loading from external files;
- animation and interactive movement.

The final application has two experience modes and two environment modes:

- **Explore Mode**: observe and inspect the map using an elevated orbit camera.
- **Race Mode**: drive a car using a third-person follow camera.
- **Day Mode**: bright sun lighting with visible shadows.
- **Night Mode**: dark environment with street lamps and vehicle headlights.

## Visual Direction

The target look is a clean, cartoon-like low-poly racing map:

- flat green forest terrain;
- winding dark-gray race track;
- alternating red/yellow track curbs;
- rounded white barriers;
- simplified pine trees built from primitives;
- a compact pit/shelter area;
- one low-poly player car;
- strong, readable lighting and shadows.

The project should recreate the *style and composition* of the reference image, not copy external assets without attribution or licensing checks.

## Technology Stack

| Area | Technology |
|---|---|
| Language | Vanilla JavaScript, ES Modules |
| Build tool | Vite |
| Rendering | Three.js `WebGLRenderer` |
| Camera control | Three.js `OrbitControls` |
| Imported 3D models | Three.js `GLTFLoader` (`.glb` / `.gltf`) |
| Demo controls | `lil-gui` or a simple custom HTML panel |
| Physics | Not required for the core submission; optional `cannon-es` extension after all rubric features work |

## Course Requirement Mapping

| Course requirement | Planned implementation in the project |
|---|---|
| Box | Pit structure, start gate, curb segments, fallback car body |
| Sphere | Lamp bulbs, decorative objects |
| Cone | Pine-tree foliage |
| Cylinder | Tree trunks, lamp poles, wheels or barrier details |
| Wheel | Vehicle wheels using `CylinderGeometry` or `TorusGeometry` |
| Teapot | Utah teapot trophy placed near the pit/podium |
| Additional geometry | Track surface, barriers, curb system, roof forms |
| Load model from file | Main car loaded from `public/models/player-car.glb` with fallback primitive car |
| Points / Lines / Solid | Render mode panel for core generated objects |
| Perspective projection | `PerspectiveCamera`; UI controls for `fov`, `near`, and `far` |
| Affine transforms | Select object and translate/rotate/scale it in Explore Mode |
| Global illumination / light source | Hemisphere/environment light plus directional sun/moon light |
| Shadows | Cars, trees and key structures cast shadows; ground and track receive shadows |
| Texture mapping | Road/grass textures and user-selected bitmap applied to a demo object or teapot |
| Animation bonus | Driving car, rotating wheels, optional demo lap and day/night transition |

## User Modes

### Explore Mode

The default mode for presenting the graphics features and letting a new user inspect the scene.

- Elevated camera view similar to the reference composition.
- Mouse orbit, zoom, and pan controls.
- Access to rendering, camera, lighting, texture, and transform controls.
- Optional automatic slow car demonstration.

### Race Mode

The interactive driving mode.

- Third-person camera smoothly follows the car.
- Keyboard driving controls.
- Simple track-boundary behavior and barrier collision.
- Camera/inspector controls that conflict with driving are disabled.

### Day and Night Modes

| Feature | Day Mode | Night Mode |
|---|---|---|
| Background | Bright sky-like color | Dark blue/black tone |
| Main light | Strong directional sunlight | Weak moon-like directional light |
| Ambient light | Medium | Low |
| Street lamps | Off | On |
| Car headlights | Off | On |
| Shadows | High readability | Visible but controlled for performance |

## Planned Controls

| Input | Action |
|---|---|
| `C` | Toggle Explore / Race mode |
| `N` | Toggle Day / Night mode |
| `1` | Solid rendering |
| `2` | Lines rendering |
| `3` | Points rendering |
| `W` / `ArrowUp` | Accelerate in Race Mode |
| `S` / `ArrowDown` | Brake / reverse in Race Mode |
| `A` / `ArrowLeft` | Steer left in Race Mode |
| `D` / `ArrowRight` | Steer right in Race Mode |
| `Esc` | Return to Explore Mode |

Transform operations are exposed through the inspector UI in Explore Mode so that driving controls are not overloaded.

## Target Project Structure

```text
forest-racing-track/
├── AGENTS.md
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── models/
│   │   └── player-car.glb
│   └── textures/
│       ├── grass.*
│       └── road.*
└── src/
    ├── main.js
    ├── style.css
    ├── core/
    │   ├── SceneManager.js
    │   ├── RendererManager.js
    │   ├── CameraManager.js
    │   └── AssetLoader.js
    ├── world/
    │   ├── Ground.js
    │   ├── RaceTrack.js
    │   ├── Curbs.js
    │   ├── Barriers.js
    │   ├── Forest.js
    │   └── PitArea.js
    ├── objects/
    │   ├── Car.js
    │   ├── StreetLamp.js
    │   └── TeapotTrophy.js
    ├── systems/
    │   ├── LightingSystem.js
    │   ├── EnvironmentSystem.js
    │   ├── RenderModeSystem.js
    │   ├── TransformSystem.js
    │   ├── TextureSystem.js
    │   ├── RaceController.js
    │   └── CollisionSystem.js
    └── ui/
        └── ControlPanel.js
```

The structure is a target architecture. Files should be added only when their phase begins; do not generate empty modules in advance unless needed for a clean initial architecture.

## Development Roadmap

| Phase | Scope | Primary deliverable |
|---:|---|---|
| 0 | Repository scaffold and baseline rules | Working Vite + Three.js app, README, AGENTS, clean build |
| 1 | Base scene and Explore camera | Green ground, daylight, shadows, orbit view |
| 2 | Track generation | Closed curved asphalt track with reusable center curve |
| 3 | Curbs and barriers | Red/yellow curbs and white guard barriers following track |
| 4 | Environment objects | Pine forest, pit shelter, lamps and start gate |
| 5 | Car and model loading | GLB car loader with primitive fallback |
| 6 | User modes | Explore Mode and Race Mode with follow camera |
| 7 | Environment modes | Day/Night lighting and lamp behavior |
| 8 | Render representations | Solid, Lines and Points demo controls |
| 9 | Camera and transformations | Perspective controls and affine transform inspector |
| 10 | Texture and teapot | Bitmap selection, road/grass mapping, teapot trophy |
| 11 | Animation and simple collision | Driving, rotating wheels, boundary response |
| 12 | Optimization and submission audit | Performance cleanup, documentation, rubric verification |

## Asset Policy

- Build the track, curbs, trees, barriers, lamps, pit structure, simple fallback car, and teapot placement using Three.js geometry wherever practical.
- Import only complex assets that make sense as external models, especially the main car.
- Use low-poly assets and compressed, appropriately sized textures.
- Record every imported asset, bitmap texture, author/source, and license in this README before submission.
- Do not include assets with unclear usage rights.

### Asset Credits

| Asset | Source / Author | License | Usage |
|---|---|---|---|
| Player car model | TBD | TBD | Main imported GLB model |
| Road texture | TBD | TBD | Track material |
| Grass texture | TBD | TBD | Ground material |

## Phase 0 Acceptance Criteria

Phase 0 is complete only when:

- the project starts with `npm run dev`;
- `npm run build` succeeds without errors;
- the browser renders a minimal Three.js scene without console errors;
- the app has a clear module entry point instead of all logic being improvised later;
- `README.md` and `AGENTS.md` exist at repository root;
- no race track, gameplay, physics engine, model assets, or feature-heavy UI has been added prematurely.

## Future Run Commands

These commands apply once Phase 0 initializes the Vite project:

```bash
npm install
npm run dev
npm run build
```

## Submission Definition of Done

The final submission must visibly demonstrate every row in the Course Requirement Mapping table through the running application and its control panel. Visual polish is important, but required graphics features take priority over additional game mechanics.
