import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// ========== SCENE SETUP ==========
const canvas = document.getElementById('webgl-canvas');
const loadingScreen = document.getElementById('loading-screen');

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ========== LIGHTING ==========
// Ambient light for overall soft illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Key light (main light from front-right)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

// Fill light (softer light from left)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-5, 0, 3);
scene.add(fillLight);

// Rim light (backlight for depth)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

// ========== MODEL LOADING ==========
let model = null;
let headBone = null; // Will store reference to the head bone
let modelGroup = new THREE.Group();
scene.add(modelGroup);

const loader = new GLTFLoader();

// Setup Draco decoder for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

// Helper function to find the head bone in the model
function findHeadBone(object) {
  let foundHead = null;

  // Common head bone names in 3D models
  const headNames = [
    'head', 'Head', 'HEAD',
    'head_joint', 'Head_Joint',
    'mixamorig:Head', 'mixamorigHead',
    'Bip01_Head', 'Bip01Head',
    'neck', 'Neck', 'NECK'
  ];

  object.traverse((child) => {
    if (!foundHead && child.isBone || child.type === 'Bone' || child.name) {
      // Check if the name contains any head-related keywords
      const childName = child.name.toLowerCase();
      for (const headName of headNames) {
        if (childName.includes(headName.toLowerCase())) {
          foundHead = child;
          console.log('Found head bone:', child.name);
          break;
        }
      }
    }
  });

  // If no specific head bone found, log all bones for debugging
  if (!foundHead) {
    console.log('Available bones/nodes in model:');
    object.traverse((child) => {
      if (child.name) {
        console.log(' -', child.name, '(type:', child.type + ')');
      }
    });
  }

  return foundHead;
}

// Add loading timeout
const loadingTimeout = setTimeout(() => {
  console.error('Loading timeout - model took too long to load');
  const loadingText = loadingScreen.querySelector('p');
  loadingText.textContent = 'Loading is taking longer than expected. The model may be large. Please wait...';
  loadingText.style.color = '#ff6b6b';
}, 15000);

const modelPath = import.meta.env.BASE_URL + 'keentse.glb';
console.log('Attempting to load model from:', modelPath);

loader.load(
  modelPath,
  (gltf) => {
    clearTimeout(loadingTimeout);
    model = gltf.scene;

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Scale adjustment (adjust if needed based on your model size)
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // Adjust the 2 to make model bigger/smaller
    model.scale.setScalar(scale);

    modelGroup.add(model);

    // Find the head bone for cursor tracking
    headBone = findHeadBone(model);

    if (headBone) {
      console.log('Head tracking enabled for:', headBone.name);
    } else {
      console.warn('No head bone found - will rotate entire model instead');
    }

    // Hide loading screen
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);

    console.log('Model loaded successfully!');
  },
  (progress) => {
    if (progress.total > 0) {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Loading: ${percent.toFixed(2)}%`);
      const loadingText = loadingScreen.querySelector('p');
      loadingText.textContent = `Loading 3D Model... ${percent.toFixed(0)}%`;
    }
  },
  (error) => {
    clearTimeout(loadingTimeout);
    console.error('Error loading model:', error);
    console.error('Model path attempted:', modelPath);
    console.error('BASE_URL:', import.meta.env.BASE_URL);
    const loadingText = loadingScreen.querySelector('p');
    loadingText.textContent = `Error: ${error.message || 'Failed to load 3D model'}`;
    loadingText.style.color = '#ff4444';
  }
);

// ========== CURSOR/TOUCH TRACKING ==========
const mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  isMoving: false
};

// Maximum rotation angles (in radians)
const MAX_ROTATION_X = THREE.MathUtils.degToRad(30);
const MAX_ROTATION_Y = THREE.MathUtils.degToRad(40);

// Lerp factor for smooth movement (lower = smoother but slower)
const LERP_FACTOR = 0.05;

// Mouse move handler
function onMouseMove(event) {
  // Normalize mouse position to -1 to 1 range
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  mouse.isMoving = true;
}

// Touch move handler
function onTouchMove(event) {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
    mouse.isMoving = true;
  }
}

// Mouse/Touch leave handlers - return to center
function onPointerLeave() {
  mouse.targetX = 0;
  mouse.targetY = 0;
  mouse.isMoving = false;
}

// Event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchmove', onTouchMove, { passive: true });
window.addEventListener('mouseleave', onPointerLeave);
window.addEventListener('touchend', onPointerLeave);

// ========== WINDOW RESIZE ==========
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onWindowResize);

// ========== SCROLL EFFECTS ==========
let scrollY = 0;

function onScroll() {
  scrollY = window.scrollY;
}

window.addEventListener('scroll', onScroll, { passive: true });

// Apply scroll effects to canvas
function applyScrollEffects() {
  const heroHeight = window.innerHeight;
  const scrollProgress = Math.min(scrollY / heroHeight, 1);

  // Fade out and slightly scale down the canvas as user scrolls
  const opacity = 1 - scrollProgress * 0.7; // Fade to 30% opacity
  const scale = 1 - scrollProgress * 0.2; // Shrink by 20%

  canvas.style.opacity = opacity.toString();
  canvas.style.transform = `scale(${scale})`;

  // Also hide scroll indicator when scrolling starts
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.opacity = (1 - scrollProgress * 2).toString();
  }
}

// ========== ANIMATION LOOP ==========
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Apply scroll effects
  applyScrollEffects();

  // Smooth lerp for mouse position
  mouse.x += (mouse.targetX - mouse.x) * LERP_FACTOR;
  mouse.y += (mouse.targetY - mouse.y) * LERP_FACTOR;

  if (model) {
    // Apply rotation based on mouse position
    if (headBone) {
      // Only rotate the head bone
      headBone.rotation.y = mouse.x * MAX_ROTATION_Y;
      headBone.rotation.x = mouse.y * MAX_ROTATION_X;
    } else {
      // Fallback: rotate entire model if head bone not found
      modelGroup.rotation.y = mouse.x * MAX_ROTATION_Y;
      modelGroup.rotation.x = mouse.y * MAX_ROTATION_X;
    }

    // Optional: subtle idle animation when not moving
    if (!mouse.isMoving && Math.abs(mouse.targetX) < 0.01 && Math.abs(mouse.targetY) < 0.01) {
      // Gentle breathing/floating effect
      modelGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.05;
    } else {
      // Reset position when moving
      modelGroup.position.y += (0 - modelGroup.position.y) * LERP_FACTOR;
    }
  }

  renderer.render(scene, camera);
}

animate();

// ========== CONTACT FORM HANDLER ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // For now, just log the form data (you can integrate with a backend later)
    console.log('Form submitted:', { name, email, message });

    // Show success message
    alert('Thank you for your message! I will get back to you soon.');

    // Reset form
    contactForm.reset();
  });
}

// ========== PERFORMANCE OPTIMIZATION ==========
// Pause rendering when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab is hidden - could pause animation here if needed
  } else {
    // Tab is visible again
  }
});
