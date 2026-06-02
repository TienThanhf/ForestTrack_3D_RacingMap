# Bang kiem yeu cau do hoa may tinh

Ngay ra soat: 2026-06-02

Pham vi ra soat: danh gia theo source code hien co trong repository. Chua thuc hien kiem tra truc quan tren trinh duyet trong lan lap tai lieu nay.

## Tom tat trang thai

| Muc yeu cau | Trang thai | Phuong phap thuc hien / ghi chu |
|---|---|---|
| 2.1.1.1 Ve cac khoi hinh co ban | Da thuc hien phan lon | Cac hinh co ban duoc tao bang geometry cua Three.js va dat vao scene qua cac module world/object. |
| 2.1.1.2 Point / Lines / Solid va cho nguoi dung chon | Da thuc hien | Co `RenderModeSystem` va UI `Graphics Demo` voi Solid, Lines, Points. |
| 2.1.1.3 Chieu phoi canh, tang giam x/y/z, near, far | Da thuc hien | Dung `PerspectiveCamera`; UI cho sua X, Y, Z, FOV, Near, Far; cap nhat projection matrix. |
| 2.1.1.4 Bien doi Affine tren khoi hinh | Da thuc hien | Dung `TransformControls`; nguoi dung chon object, chon Translate/Rotate/Scale bang UI hoac phim tat. |
| 2.1.1.5 Chieu sang doi tuong, nguon sang, bong do | Da thuc hien | Co HemisphereLight, DirectionalLight, PointLight, SpotLight; renderer bat shadow map; nhieu mesh cast/receive shadow. |
| 2.1.1.6 Texture bitmap do nguoi dung chon | Mot phan / chua du | Da co texture mapping bang `CanvasTexture` va `TextureLoader` cho anh co dinh, nhung chua thay chuc nang chon mo file anh bitmap tu nguoi dung de map len doi tuong. |
| 2.1.1.7 Animation bonus | Da thuc hien | Co animation xe chay, banh xe quay, camera follow, cay rung theo gio. |

## Chi tiet tung yeu cau

### 2.1.1.1 Ve cac khoi hinh co ban

| Doi tuong | Trang thai | Phuong phap thuc hien / file lien quan |
|---|---|---|
| Hinh hop | Da thuc hien | Dung `THREE.BoxGeometry` cho than xe fallback, cabin, pit shelter, start gate, curb, barrier, billboard. File tieu bieu: `src/objects/Car.js`, `src/world/PitArea.js`, `src/world/StartGate.js`, `src/world/Curbs.js`, `src/world/Barriers.js`. |
| Hinh cau | Da thuc hien | Dung `THREE.SphereGeometry` cho bong den pit/service lamp. File: `src/world/PitArea.js`; `src/objects/StreetLamp.js` cung co bong den cau. |
| Hinh non | Da thuc hien | Dung `THREE.ConeGeometry` cho tan cay thong va nap/cap bien trang tri. File: `src/world/Forest.js`, `src/world/PitArea.js`. |
| Hinh tru | Da thuc hien | Dung `THREE.CylinderGeometry` cho than cay, cot den, cot pit, thung nhien lieu, banh xe fallback, be teapot. File: `src/world/Forest.js`, `src/world/PitArea.js`, `src/objects/Car.js`, `src/objects/TeapotTrophy.js`. |
| Banh xe | Da thuc hien | Xe fallback tao banh bang `CylinderGeometry`; pit co lop du phong bang `TorusGeometry`; model GLB co node banh xe duoc thu thap de quay animation. File: `src/objects/Car.js`, `src/world/PitArea.js`, `src/config/vehicleConfig.js`. |
| Am tra | Da thuc hien | Dung `TeapotGeometry` trong `TeapotTrophy`, dat tren be gan khu pit. File: `src/objects/TeapotTrophy.js`. |
| Hinh khac tu tim hieu | Da thuc hien | Duong dua duoc tu tao bang `BufferGeometry` theo `CatmullRomCurve3`; co barrier, curb, start/finish line, road shoulders, billboard, pit decorations. File: `src/world/RaceTrack.js`, `src/world/RoadShoulders.js`, `src/world/RoadDecorations.js`. |
| Load model co san tu tap tin | Da thuc hien | Dung `GLTFLoader` qua `AssetLoader`; xe load tu `/models/green_car.glb` va `/models/black_car.glb`; con co streetlight, rock, finish gate/nature assets trong `public/models`. File: `src/core/AssetLoader.js`, `src/objects/Car.js`, `src/config/vehicleConfig.js`, `public/models/`. |

### 2.1.1.2 Ve theo Point, Lines, Solid

Trang thai: Da thuc hien.

Phuong phap:
- `RenderModeSystem` dinh nghia 3 che do `SOLID`, `LINES`, `POINTS`.
- Lines tao overlay bang `THREE.WireframeGeometry` va `THREE.LineSegments`.
- Points tao overlay bang geometry clone va `THREE.PointsMaterial`.
- UI `ModeControls` co select target va nut `Solid`, `Lines`, `Points`.
- Phim tat `1`, `2`, `3` doi render mode qua `InputController`.

File lien quan: `src/systems/RenderModeSystem.js`, `src/ui/ModeControls.js`, `src/systems/InputController.js`, `src/core/SceneManager.js`.

### 2.1.1.3 Chieu phoi canh va dieu chinh camera

Trang thai: Da thuc hien.

Phuong phap:
- `CameraManager` tao `THREE.PerspectiveCamera`.
- UI `Camera / Perspective` cho sua `X`, `Y`, `Z`, `FOV`, `Near`, `Far`.
- Khi doi FOV/Near/Far, `CameraManager.setPerspective()` goi `camera.updateProjectionMatrix()`.
- Resize cung cap nhat aspect va projection matrix.

File lien quan: `src/core/CameraManager.js`, `src/ui/ModeControls.js`, `src/main.js`.

### 2.1.1.4 Bien doi Affine co so

Trang thai: Da thuc hien.

Phuong phap:
- `TransformSystem` dung `TransformControls` cua Three.js.
- Co danh sach doi tuong de chon: tree sample, start gate, pit shelter, teapot trophy, player car, v.v.
- UI `Transform Inspector` cho chon object va chon `Translate`, `Rotate`, `Scale`.
- Co phim tat `T`, `R`, `S` de doi che do transform trong Explore Mode.
- Thao tac bien doi thuc hien bang gizmo chuot cua `TransformControls`.

File lien quan: `src/systems/TransformSystem.js`, `src/ui/ModeControls.js`, `src/systems/InputController.js`, `src/core/SceneManager.js`.

### 2.1.1.5 Chieu sang doi tuong

Trang thai: Da thuc hien.

Phuong phap:
- Chieu sang toan phan / moi truong: `HemisphereLight` trong `LightingSystem`.
- Nguon sang chinh: `DirectionalLight` cho mat troi/mat trang, co shadow.
- Nguon sang cuc bo: `PointLight` trong pit/service lamps, `SpotLight` cho street lights, start gate va headlights.
- Bong do: `RendererManager` bat `renderer.shadowMap.enabled`; nhieu mesh dat `castShadow` va/hoac `receiveShadow`; ground/track nhan bong.
- Day/Night thay doi nen, fog, cuong do den, den duong, den pit va headlights.

File lien quan: `src/core/RendererManager.js`, `src/systems/LightingSystem.js`, `src/core/SceneManager.js`, `src/world/PitArea.js`, `src/world/StartGate.js`, `src/objects/ImportedStreetLight.js`, `src/objects/Car.js`.

### 2.1.1.6 Texture

Trang thai: Mot phan / chua du yeu cau.

Da co:
- Duong dua dung texture asphalt tao bang `THREE.CanvasTexture`.
- Bien/trang tri pit dung `CanvasTexture`.
- Billboard dung `THREE.TextureLoader().load()` de load anh logo co dinh `public/logo.png`.

Chua thay:
- Chua co `TextureSystem.js` trong `src/systems/`.
- Chua co input file anh bitmap cho nguoi dung chon mo anh.
- Chua co luong ap anh do nguoi dung chon len mot object bat ky.

File lien quan: `src/world/RaceTrack.js`, `src/world/PitArea.js`, `src/world/Billboard.js`, `public/logo.png`.

### 2.1.1.7 Animation bonus

Trang thai: Da thuc hien.

Phuong phap:
- Vong lap render dung `renderer.setAnimationLoop()`.
- Race Mode cap nhat xe theo input, toc do, steering va vi tri.
- Banh xe quay theo toc do xe trong `Car.updateWheelAnimation()`.
- Camera follow trong Race Mode noi suy muot bang `MathUtils.damp`.
- Cay trong forest co animation sway theo thoi gian.

File lien quan: `src/core/SceneManager.js`, `src/systems/RaceController.js`, `src/objects/Car.js`, `src/world/Forest.js`.

## Cac muc can bo sung de dat du yeu cau

1. Them chuc nang cho nguoi dung chon mo anh bitmap va texture mapping len doi tuong, vi hien tai texture chi la procedural/canvas hoac anh co dinh.
2. Neu can nop bao cao/chung minh, nen chay ung dung va chup anh minh hoa cho 3 che do Solid/Lines/Points, transform inspector, camera perspective controls, lighting/shadow va animation.
3. README hien con mot so credit asset la `TBD`; neu cac model GLB la asset ben ngoai thi can cap nhat nguon va license truoc khi nop.
