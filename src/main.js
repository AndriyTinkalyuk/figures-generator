import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const canvas = document.getElementById('canvas');
const generateButton = document.getElementById('generate');
const explodeButton = document.getElementById('explode');
const collectButton = document.getElementById('collect');
const fullscreenButton = document.getElementById("fullscreen")

// scene
const scene = new THREE.Scene();

// camera
const sizes = { 
  width : window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(10, 10, 10);

// renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);

const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
];

const textureLoader = new THREE.TextureLoader();

const textures = [
  textureLoader.load('textures/wall.jpg'),
  textureLoader.load('textures/water.jpg'),
  textureLoader.load('textures/fire.jpg')
];

textures.forEach(texture => texture.colorSpace = THREE.SRGBColorSpace)

const meshes = [];

function clearScene() {
  for (let mesh of meshes) {
    scene.remove(mesh);
  }
  meshes.length = 0;
}

function generateCube(x, y, z) {
  clearScene();
  const offsetX = (x - 1) / 2;
  const offsetY = (y - 1) / 2;
  const offsetZ = (z - 1) / 2;

  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = new THREE.MeshBasicMaterial({
          map: textures[Math.floor(Math.random() * textures.length)]
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(i - offsetX, j - offsetY, k - offsetZ);
        mesh.userData = {
          initialPos: mesh.position.clone(),
          initialRot: mesh.rotation.clone(),
          isAnimating: false,
        };
        scene.add(mesh);
        meshes.push(mesh);
      }
    }
  }
}

generateButton.addEventListener('click', () => {
  const x = +document.getElementById('x').value;
  const y = +document.getElementById('y').value;
  const z = +document.getElementById('z').value;
  generateCube(x, y, z);
});

explodeButton.addEventListener("click", () => {
  for (let mesh of meshes) {
    if (mesh.userData.isAnimating) continue; 

    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize().multiplyScalar(5 + Math.random() * 3);

    const targetPos = mesh.position.clone().add(dir);

    mesh.userData.isAnimating = true;

    // Анімуємо позицію
    gsap.to(mesh.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 2,
      ease: "power2.out",
    });

    // Анімуємо обертання (додатково + випадкове обертання)
    gsap.to(mesh.rotation, {
      x: mesh.rotation.x + (Math.random() - 0.5) * Math.PI * 4,
      y: mesh.rotation.y + (Math.random() - 0.5) * Math.PI * 4,
      z: mesh.rotation.z + (Math.random() - 0.5) * Math.PI * 4,
      duration: 2,
      ease: "power2.out",
      onComplete: () => {
        mesh.userData.isAnimating = false;
      }
    });
  }
});

collectButton.addEventListener("click", () => {
  for (let mesh of meshes) {
    if (mesh.userData.isAnimating) continue;

    mesh.userData.isAnimating = true;

    gsap.to(mesh.position, {
      x: mesh.userData.initialPos.x,
      y: mesh.userData.initialPos.y,
      z: mesh.userData.initialPos.z,
      duration: 2,
      ease: "power2.inOut"
    });

    gsap.to(mesh.rotation, {
      x: mesh.userData.initialRot.x,
      y: mesh.userData.initialRot.y,
      z: mesh.userData.initialRot.z,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        mesh.userData.isAnimating = false;
      }
    });
  }
});

// Анімаційний цикл лише для рендера і оновлення контролів

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// resize

window.addEventListener('resize', () => { 
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

fullscreenButton.addEventListener('click', () => { 
   const fullscreenElement = document.fullscreenElement;

  if (!fullscreenElement) { 
    canvas.requestFullscreen();
  }
})

window.addEventListener("dblclick", () => { 
     const fullscreenElement = document.fullscreenElement;

  if (fullscreenElement) { 
    document.exitFullscreen();
  }
});
