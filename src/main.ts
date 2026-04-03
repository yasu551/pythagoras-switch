import { World } from './world/World';
import { Director } from './systems/Director';
import { CourseBuilder } from './course/CourseBuilder';
import { CameraDirector } from './systems/CameraDirector';
import { SoundManager } from './systems/SoundManager';

let world: World;
let director: Director;
let courseBuilder: CourseBuilder;
let cameraDirector: CameraDirector;
let soundManager: SoundManager;
let running = false;

async function init(): Promise<void> {
  world = new World();
  await world.init();

  soundManager = new SoundManager();
  cameraDirector = new CameraDirector(world.camera);
  courseBuilder = new CourseBuilder(world);
  director = new Director(world, courseBuilder, cameraDirector, soundManager);
  courseBuilder.setDirector(director);

  // Build the full course
  director.setupTriggers();
  courseBuilder.buildAll();

  // Debug: expose for inspection
  (window as any).__world = world;
  (window as any).__scene = world.scene;
  (window as any).__course = courseBuilder;
  (window as any).__director = director;

  // Render loop
  function animate(): void {
    requestAnimationFrame(animate);

    if (running) {
      const dt = Math.min(world.clock.getDelta(), 1 / 30);
      director.update(dt);
      world.step(dt, director.timeScale);
      cameraDirector.update(dt);
    }

    world.render();
  }
  animate();

  // Start button
  const startBtn = document.getElementById('start-btn')!;
  const overlay = document.getElementById('overlay')!;
  const replayBtn = document.getElementById('replay-btn')!;

  startBtn.addEventListener('click', () => {
    soundManager.resumeContext();
    overlay.classList.add('hidden');
    running = true;
    director.start();
  });

  replayBtn.addEventListener('click', () => {
    replayBtn.style.display = 'none';
    reset();
  });

  // Director finale callback
  director.onFinale = () => {
    setTimeout(() => {
      replayBtn.style.display = 'block';
    }, 3000);
  };
}

function reset(): void {
  running = false;
  world.resetPhysics();
  courseBuilder.destroyAll();
  courseBuilder.buildAll();
  director.reset();
  director.setupTriggers();
  cameraDirector.reset();
  running = true;
  director.start();
}

init();
