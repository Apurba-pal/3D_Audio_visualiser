// basic shere moving  

// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.168.0/three.module.js';

// create the scene
const scene = new THREE.Scene();

// set the camera
const camera  = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
camera.position.z = 5;

// create the webGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create the geometry and points material
const geometry = new THREE.SphereGeometry(1,32,32);
const pointsMaterial = new THREE.PointsMaterial({
    color: "blue",
    size: 0.02
});
const points = new THREE.Points(geometry, pointsMaterial);
scene.add(points);

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

function animate() {
  requestAnimationFrame(animate);
  
  // get the average frequency value from the analyser
  const data = analyser.getAverageFrequency();
  
  // use the frequency data to scale the sphere
  const scale = data / 128.0;  // normalize the value
  points.scale.set(scale, scale, scale);

  // points.rotation.x += 0.05;
  points.rotation.y += 0.05;
  points.rotation.z += 0.05;

  renderer.render(scene, camera);
}

// start the animation
animate();
