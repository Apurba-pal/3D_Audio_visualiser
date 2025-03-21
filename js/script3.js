// create the scene
const scene = new THREE.Scene();

// set the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
); 
camera.position.z = 5;

// create the webGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// lighting 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pLight1 = new THREE.PointLight(0xffffff, 1, 100);
pLight1.position.set(0, 0, 10);
pLight1.castShadow = true;
scene.add(pLight1);

const pLight2 = new THREE.PointLight(0x2f0000, 1, 100);
pLight2.position.set(12, 0, -2);
pLight2.castShadow = true;
scene.add(pLight2);

const pLight3 = new THREE.PointLight(0x00002f, 1, 100);
pLight3.position.set(-12, 0, -2);
pLight3.castShadow = true;
scene.add(pLight3);

//  mid light
const midLight = new THREE.SpotLight(0xffffff, 1, 0.3);
midLight.position.set(0, 0, 0);
midLight.castShadow = true;
scene.add(midLight);

// torus geometry
let torusGeometry = [
  new THREE.SphereGeometry(8, 40, 40, 150),
  new THREE.SphereGeometry(8, 40, 40, 150),
  new THREE.SphereGeometry(8, 40, 40, 150),
];

// Add color attribute to the geometry
torusGeometry.forEach(geometry => {
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
});

// Create materials
let materials = [
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.5,
  }),
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.5,
  }),
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 2,
    metalness: 0.5,
  }),
];

let spheres = [];
torusGeometry.forEach((g, i) => spheres.push(new THREE.Mesh(g, materials[i])));
spheres.forEach((sphere) => scene.add(sphere));

const noise = new window.SimplexNoise();

// setup Web Audio API
const listener = new THREE.AudioListener();
camera.add(listener); 
const sound = new THREE.Audio(listener);

const analyser = new THREE.AudioAnalyser(sound, 32);

document.getElementById('audioFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();

        fileReader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.setVolume(0.5);
                sound.play();
            });
        };

        fileReader.readAsArrayBuffer(file);
    }
});

let time = 0;
function animate() {
  const maxChange = 0.25;

  // get the average frequency value from the analyser
  const data = analyser.getAverageFrequency();
  const scale = data / 128.0;  // normalize the value

  torusGeometry.forEach((geometry, index) => {
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positions.length; i += 3) {
      vertex.set(positions[i], positions[i + 1], positions[i + 2]);
      const noiseValue = noise.noise4D(vertex.x, vertex.y, vertex.z, time + index);
      const displacement = maxChange * noiseValue * scale;  // modify displacement based on audio data
      vertex.normalize().multiplyScalar(1 + displacement);
      positions[i] = vertex.x;
      positions[i + 1] = vertex.y; 
      positions[i + 2] = vertex.z;

      const baseColor = new THREE.Color('teal');
      const displacedColor = new THREE.Color('aqua');
      const color = baseColor.lerp(displacedColor, Math.abs(displacement) / maxChange);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  time += 0.015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();