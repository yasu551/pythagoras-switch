import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

interface SyncEntry {
  body: RAPIER.RigidBody;
  mesh: THREE.Object3D;
}

export class PhysicsSync {
  private entries: Map<number, SyncEntry> = new Map();
  private world: RAPIER.World;

  constructor(world: RAPIER.World) {
    this.world = world;
  }

  register(body: RAPIER.RigidBody, mesh: THREE.Object3D): void {
    this.entries.set(body.handle, { body, mesh });
  }

  unregister(body: RAPIER.RigidBody): void {
    this.entries.delete(body.handle);
  }

  update(): void {
    for (const entry of this.entries.values()) {
      const pos = entry.body.translation();
      const rot = entry.body.rotation();
      entry.mesh.position.set(pos.x, pos.y, pos.z);
      entry.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  }

  clear(): void {
    this.entries.clear();
  }

  getBody(handle: number): RAPIER.RigidBody | undefined {
    return this.entries.get(handle)?.body;
  }

  getMesh(handle: number): THREE.Object3D | undefined {
    return this.entries.get(handle)?.mesh;
  }
}
