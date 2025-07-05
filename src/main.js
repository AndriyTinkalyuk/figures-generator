import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const canvas = document.getElementById('canvas');
const generateButton = document.getElementById('generate');
const explodeButton = document.getElementById('explode');
const collectButton = document.getElementById('collect');


//scene
const scene = new THREE.Scene();

//camera 

const sizes = { 
  width : window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.set(10, 10, 10);

// Renderer

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
          targetPos: mesh.position.clone(),
          rotationSpeed: new THREE.Vector3(0, 0, 0),
          isExploded: false,
          lerpProgress: 0, 
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
})

explodeButton.addEventListener("click", () => {
  for (let mesh of meshes) {
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    )
      .normalize()
      .multiplyScalar(5 + Math.random() * 3);

    mesh.userData.targetPos = mesh.position.clone().add(dir);
    mesh.userData.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2
    );
    mesh.userData.isExploded = true;
    mesh.userData.lerpProgress = 0;
  }
}) 

collectButton.addEventListener("click", () => {
  for (let mesh of meshes) {
    mesh.userData.targetPos = mesh.userData.initialPos.clone();
    mesh.userData.isExploded = false;
    mesh.userData.lerpProgress = 0;

       mesh.rotation.copy(mesh.userData.initialRot);
  }
})

const clock = new THREE.Clock();

function animate() {

  const delta = clock.getDelta();
  requestAnimationFrame(animate);

  for (let mesh of meshes) {
    const userData = mesh.userData;
    const target = userData.targetPos;

    if (target) {
      // Обчислюємо відстань до цілі
      const distance = mesh.position.distanceTo(target);

      // Плавне наближення до цілі
      mesh.position.lerp(target, 0.01);

      if (distance < 0.1) {
  mesh.position.copy(target);
  userData.targetPos = null;

  // Зупинити обертання повністю після досягнення цілі
  userData.rotationSpeed.set(0, 0, 0);
}

    }

    // Обертання: тільки під час вибуху або поступового гальмування
    if (userData.rotationSpeed.length() > 0.01) {
      mesh.rotation.x += userData.rotationSpeed.x * delta;
      mesh.rotation.y += userData.rotationSpeed.y * delta;
      mesh.rotation.z += userData.rotationSpeed.z * delta;

      // Якщо не вибух — поступово зменшуємо швидкість
    if (userData.isExploded) {
userData.rotationSpeed.multiplyScalar(0.98);

} else {
  // Коли не вибух — просто загальмовуємо як раніше
  userData.rotationSpeed.multiplyScalar(0.9);
}
    } else {
      userData.rotationSpeed.set(0, 0, 0); // гарантована зупинка
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();



//resize

window.addEventListener('resize', () => { 
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

   //update render
  renderer.setSize(sizes.width, sizes.height);
  //update PixelRatio
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener("dblclick", () => { 
  const fullscreenElement = document.fullscreenElement 

  if(!fullscreenElement) { 
    canvas.requestFullscreen()
    return
  }
  document.exitFullscreen()
})