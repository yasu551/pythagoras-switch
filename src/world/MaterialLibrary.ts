import * as THREE from 'three';

export class MaterialLibrary {
  ball: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  darkWood: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  marble: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  industrialSteel: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  copper: THREE.MeshStandardMaterial;
  flag: THREE.MeshStandardMaterial;
  guide: THREE.MeshStandardMaterial;

  constructor(envMap?: THREE.Texture) {
    this.ball = new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      metalness: 0.95,
      roughness: 0.15,
      envMap,
      envMapIntensity: 1.5,
    });

    this.wood = new THREE.MeshStandardMaterial({
      color: 0x8B6914,
      metalness: 0,
      roughness: 0.75,
    });

    this.darkWood = new THREE.MeshStandardMaterial({
      color: 0x3a2a1a,
      metalness: 0,
      roughness: 0.65,
    });

    this.brass = new THREE.MeshStandardMaterial({
      color: 0xb5a642,
      metalness: 0.75,
      roughness: 0.35,
      envMap,
      envMapIntensity: 0.8,
    });

    this.marble = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      metalness: 0.02,
      roughness: 0.25,
    });

    this.steel = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.95,
      roughness: 0.2,
      envMap,
      envMapIntensity: 1.0,
    });

    this.industrialSteel = new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.85,
      roughness: 0.45,
      envMap,
      envMapIntensity: 0.6,
    });

    this.chrome = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 1.0,
      roughness: 0.05,
      envMap,
      envMapIntensity: 2.0,
    });

    this.copper = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.85,
      roughness: 0.25,
      envMap,
      envMapIntensity: 0.8,
    });

    this.flag = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.9,
    });

    this.guide = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    });
  }
}
