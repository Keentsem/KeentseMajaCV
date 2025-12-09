import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// ========== PROJECTS BOARD SCENE SETUP ==========
const projectsCanvas = document.getElementById('projects-canvas');

if (projectsCanvas) {
  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    projectsCanvas.clientWidth / projectsCanvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: projectsCanvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(projectsCanvas.clientWidth, projectsCanvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // ========== LIGHTING ==========
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xff00ff, 1.2);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00ffff, 0.8);
  fillLight.position.set(-5, 3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x00ff88, 0.6);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  // ========== LOAD PROJECTS BOARD MODEL ==========
  let projectsBoard = null;
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load(
    import.meta.env.BASE_URL + 'projects.glb',
    (gltf) => {
      projectsBoard = gltf.scene;

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(projectsBoard);
      const center = box.getCenter(new THREE.Vector3());
      projectsBoard.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim; // Adjust scale as needed
      projectsBoard.scale.setScalar(scale);

      scene.add(projectsBoard);
      console.log('Projects board loaded successfully!');
    },
    (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Loading projects board: ${percent.toFixed(2)}%`);
    },
    (error) => {
      console.error('Error loading projects board:', error);
    }
  );

  // ========== MOUSE INTERACTION ==========
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  function onMouseMove(event) {
    const rect = projectsCanvas.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  projectsCanvas.addEventListener('mousemove', onMouseMove);

  // ========== RESIZE HANDLER ==========
  function onResize() {
    const width = projectsCanvas.clientWidth;
    const height = projectsCanvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);

  // ========== ANIMATION LOOP ==========
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth lerp
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    if (projectsBoard) {
      // Gentle rotation based on mouse position
      projectsBoard.rotation.y = mouseX * 0.3;
      projectsBoard.rotation.x = mouseY * 0.2;

      // Subtle floating animation
      projectsBoard.position.y += Math.sin(elapsedTime * 0.5) * 0.001;
    }

    renderer.render(scene, camera);
  }

  animate();
}
