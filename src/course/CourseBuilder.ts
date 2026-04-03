import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { World } from '../world/World';
import { Director } from '../systems/Director';
import { buildStage1 } from './stages/Stage1_FreeFall';
import { buildStage2 } from './stages/Stage2_Spiral';
import { buildStage3 } from './stages/Stage3_Jump';
import { buildStage4 } from './stages/Stage4_Dominoes';
import { buildStage5 } from './stages/Stage5_GravityReveal';
import { buildStage6 } from './stages/Stage6_Elevator';
import { buildStage7 } from './stages/Stage7_Loop';
import { buildStage8 } from './stages/Stage8_Finale';
import { S1_BALL_START } from './StageDefinitions';

export class CourseBuilder {
  world: World;
  director!: Director;

  // Ball references
  ballBody: RAPIER.RigidBody | null = null;
  ballMesh: THREE.Mesh | null = null;

  // All meshes for cleanup
  private meshes: THREE.Object3D[] = [];
  private bodies: RAPIER.RigidBody[] = [];

  // Flag for finale
  flagMesh: THREE.Object3D | null = null;

  constructor(world: World) {
    this.world = world;
  }

  setDirector(director: Director): void {
    this.director = director;
  }

  buildAll(): void {
    this.buildBall();
    buildStage1(this);
    buildStage2(this);
    buildStage3(this);
    buildStage4(this);
    buildStage5(this);
    buildStage6(this);
    buildStage7(this);
    buildStage8(this);
  }

  private buildBall(): void {
    const radius = 0.3;
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mesh = new THREE.Mesh(geo, this.world.materials.ball);
    mesh.castShadow = true;
    mesh.position.copy(S1_BALL_START);
    this.world.courseGroup.add(mesh);
    this.meshes.push(mesh);
    this.ballMesh = mesh;

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(S1_BALL_START.x, S1_BALL_START.y, S1_BALL_START.z)
      .setCcdEnabled(true);
    const body = this.world.rapierWorld.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
      .setFriction(0.3)
      .setRestitution(0.3)
      .setDensity(8.0);
    this.world.rapierWorld.createCollider(colliderDesc, body);

    this.ballBody = body;
    this.bodies.push(body);
    this.world.physicsSync.register(body, mesh);
  }

  /** Add a static box (ramp, platform, wall, etc.) */
  addStaticBox(
    position: THREE.Vector3,
    size: THREE.Vector3,
    material: THREE.Material,
    rotation?: THREE.Euler,
    friction = 0.3,
    restitution = 0.2,
  ): { mesh: THREE.Mesh; body: RAPIER.RigidBody } {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(position);
    if (rotation) mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.world.courseGroup.add(mesh);
    this.meshes.push(mesh);

    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y, position.z);
    if (rotation) {
      const q = new THREE.Quaternion().setFromEuler(rotation);
      bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }
    const body = this.world.rapierWorld.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setFriction(friction)
      .setRestitution(restitution);
    this.world.rapierWorld.createCollider(colliderDesc, body);

    this.bodies.push(body);
    return { mesh, body };
  }

  /** Add a dynamic box (domino, weight, etc.) */
  addDynamicBox(
    position: THREE.Vector3,
    size: THREE.Vector3,
    material: THREE.Material,
    density = 1.0,
    friction = 0.5,
    restitution = 0.1,
  ): { mesh: THREE.Mesh; body: RAPIER.RigidBody } {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    this.world.courseGroup.add(mesh);
    this.meshes.push(mesh);

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z);
    const body = this.world.rapierWorld.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setDensity(density)
      .setFriction(friction)
      .setRestitution(restitution);
    this.world.rapierWorld.createCollider(colliderDesc, body);

    this.bodies.push(body);
    this.world.physicsSync.register(body, mesh);
    return { mesh, body };
  }

  /** Add a ramp with side walls */
  addRamp(
    center: THREE.Vector3,
    length: number,
    angleDeg: number,
    material: THREE.Material,
    width = 1.2,
    addWalls = true,
  ): void {
    const thickness = 0.15;
    const size = new THREE.Vector3(length, thickness, width);
    const rot = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(angleDeg));
    this.addStaticBox(center, size, material, rot, 0.2, 0.1);

    if (addWalls) {
      const wallH = 0.4;
      const wallSize = new THREE.Vector3(length, wallH, 0.08);
      const offZ = width / 2 + 0.04;
      this.addStaticBox(
        new THREE.Vector3(center.x, center.y + wallH / 2 + thickness / 2, center.z + offZ),
        wallSize, material, rot
      );
      this.addStaticBox(
        new THREE.Vector3(center.x, center.y + wallH / 2 + thickness / 2, center.z - offZ),
        wallSize, material, rot
      );
    }
  }

  /** Add a mesh without physics (visual only) */
  addVisualMesh(mesh: THREE.Object3D): void {
    this.world.courseGroup.add(mesh);
    this.meshes.push(mesh);
  }

  /** Register a body for sync */
  registerBody(body: RAPIER.RigidBody, mesh: THREE.Object3D): void {
    this.bodies.push(body);
    this.world.physicsSync.register(body, mesh);
  }

  destroyAll(): void {
    // Remove meshes
    for (const mesh of this.meshes) {
      this.world.courseGroup.remove(mesh);
      if ((mesh as THREE.Mesh).geometry) {
        (mesh as THREE.Mesh).geometry.dispose();
      }
    }
    this.meshes = [];
    this.ballMesh = null;
    this.ballBody = null;
    this.flagMesh = null;
  }
}
