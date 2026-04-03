import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { MaterialLibrary } from './MaterialLibrary';
import { PhysicsSync } from '../systems/PhysicsSync';

export class World {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  clock!: THREE.Clock;
  rapierWorld!: RAPIER.World;
  physicsSync!: PhysicsSync;
  materials!: MaterialLibrary;
  courseGroup!: THREE.Group;

  // Lighting
  dirLight!: THREE.DirectionalLight;

  async init(): Promise<void> {
    // Init Rapier WASM
    await RAPIER.init();

    // Scene
    this.scene = new THREE.Scene();

    // Sky gradient background
    const skyColor = new THREE.Color(0x87ceeb);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.Fog(skyColor, 50, 100);

    // Course group
    this.courseGroup = new THREE.Group();
    this.scene.add(this.courseGroup);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 12, 15);
    this.camera.lookAt(5, 5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    document.body.appendChild(this.renderer.domElement);

    // Clock
    this.clock = new THREE.Clock();

    // Lighting (before materials so env map is ready)
    this.setupLighting();

    // Environment map for reflections
    const envMap = this.createEnvMap();

    // Materials
    this.materials = new MaterialLibrary(envMap);

    // Floor
    this.buildFloor();

    // Physics
    const gravity = new RAPIER.Vector3(0, -9.81, 0);
    this.rapierWorld = new RAPIER.World(gravity);
    this.physicsSync = new PhysicsSync(this.rapierWorld);

    // Floor collider — lowered to allow Stage 5 drop
    const floorDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50)
      .setTranslation(0, -3.5, 0)
      .setFriction(0.5)
      .setRestitution(0.3);
    this.rapierWorld.createCollider(floorDesc);

    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  private setupLighting(): void {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambient);

    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b6914, 0.5);
    this.scene.add(hemi);

    // Key light (directional, shadows)
    this.dirLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    this.dirLight.position.set(10, 15, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 60;
    this.dirLight.shadow.camera.left = -10;
    this.dirLight.shadow.camera.right = 40;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -10;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);
  }

  private createEnvMap(): THREE.Texture {
    // Simple gradient env map for metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a simple gradient scene for the env map
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(10, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      vertexColors: true,
    });

    // Apply a sky-to-ground gradient via vertex colors
    const colors = [];
    const positions = envGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const t = (y / 10 + 1) / 2; // 0 (bottom) to 1 (top)
      const c = new THREE.Color().lerpColors(
        new THREE.Color(0x8B6914), // warm ground
        new THREE.Color(0xadd8e6), // light sky
        t
      );
      colors.push(c.r, c.g, c.b);
    }
    envGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    envScene.add(new THREE.Mesh(envGeo, envMat));

    const renderTarget = pmremGenerator.fromScene(envScene);
    pmremGenerator.dispose();
    envGeo.dispose();
    envMat.dispose();

    return renderTarget.texture;
  }

  private buildFloor(): void {
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeo, this.materials.marble);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.4;
    floor.receiveShadow = true;
    this.courseGroup.add(floor);
  }

  step(dt: number, timeScale: number): void {
    const scaledDt = dt * timeScale;
    if (scaledDt > 0) {
      this.rapierWorld.timestep = scaledDt;
      this.rapierWorld.step();
      this.physicsSync.update();
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  resetPhysics(): void {
    // Remove all bodies and colliders
    this.rapierWorld.bodies.forEach((body) => {
      this.rapierWorld.removeRigidBody(body);
    });
    this.physicsSync.clear();

    // Re-create floor collider
    const floorDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50)
      .setTranslation(0, -3.5, 0)
      .setFriction(0.5)
      .setRestitution(0.3);
    this.rapierWorld.createCollider(floorDesc);

    // Reset gravity
    this.rapierWorld.gravity = new RAPIER.Vector3(0, -9.81, 0);

    // Reset course group rotation
    this.courseGroup.rotation.set(0, 0, 0);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
