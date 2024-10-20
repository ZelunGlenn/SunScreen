const textForUV = document.querySelector('#textForUV');

document.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const { latitude, longitude } = position.coords

        fetch('/save-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude: latitude, longitude: longitude }),
        })
        .then(response => response.json())
        .then(data => {
          
          if (data.severity) {
            const mainDiv = document.getElementById('mainDiv');
            mainDiv.innerText = data.severity
            textForUV.style.display = 'block'
            if (mainDiv.innerText <= 2) {
              textForUV.innerText = 'Low'
            } else if ( mainDiv.innerText <= 5) {
              textForUV.innerText = 'Moderate'

            } else if ( mainDiv.innerText <= 7) {
              textForUV.innerText = 'High'

            } else if ( mainDiv.innerText <= 10) {
              textForUV.innerText = 'Very High'

            } else {
              textForUV.innerText = 'Extreme'
            }
          } else {
            document.getElementById('mainDiv').innerText = 'Failed to fetch UV data. Please try again later.'
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        })
      },
      function (err) {
        console.log(err)
      }
    )
  } else {
    console.log("ego function is not supported")
  }
})


//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


//Create a Three.JS Scene
const scene = new THREE.Scene()
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 3, 10)

let object;  // Bottle object
let controls;
let objToRender = 'bottle';
let bottleDropped = false; // To keep track of animation state
let bottleInitialY = 10;   // Starting Y position for bottle drop
let bottleTargetY = 0;     // Target Y position for bottle drop
let dropSpeed = 0.05;      // Speed at which the bottle drops

// Canvas for 2D wave effect
const waveCanvas = document.getElementById("waveCanvas");
const waveCtx = waveCanvas.getContext("2d");
waveCanvas.width = window.innerWidth;
waveCanvas.height = window.innerHeight;
let waveY = window.innerHeight;  // Start at the bottom
let waveSpeed = 2;               // Speed of wave rising
let waveAmplitude = 20;          // Height of wave crests
let waveFrequency = 0.02;        // Frequency of wave crests
let wavePhase = 0;               // Initial phase of the wave


const mainDiv = document.querySelector("#mainDiv");



const loader = new GLTFLoader()

//Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {

    object = gltf.scene;

    // Traverse through all meshes in the object to apply transparency
    object.traverse((node) => {
      // if (node.isMesh && node.name === 'Object_2') {
      //   console.log(node.name)
      //   // Enable transparency for the material
      //   node.material.transparent = true;
        
      //   // Set opacity if you want a uniform transparency across the object
      //   node.material.opacity = 0.4; // Example: 80% opacity

      //   // If the texture has an alpha map, you can load it here (optional)
      //   // node.material.alphaMap = new THREE.TextureLoader().load('path_to_alpha_texture.png');
        
      //   // Enable depthWrite if you want to correctly handle overlapping transparent objects
      //   node.material.depthWrite = false; 
      // }
    });


    //If the file is loaded, add it to the scene
    object = gltf.scene
    object.scale.set(2, 2, 2)
    object.position.set(0, bottleInitialY, 0); // Start above the screen
    scene.add(object)
  },
  function (xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  },
  function (error) {
    //If there is an error, log it
    console.error("Error on loading object: ", error)
  }
)

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

//Add the renderer to the DOM
document.getElementById("threeDObject").appendChild(renderer.domElement);


// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500); // top-left-ish
topLight.castShadow = true;
scene.add(topLight);

// Add ambient light, with a conditional check for objToRender
const ambientIntensity = objToRender ? 5 : 1; // Adjust based on the presence or type of objToRender
const ambientLight = new THREE.AmbientLight(0x333333, ambientIntensity);
scene.add(ambientLight);


let lowLevelColor = "#98D600",
  moderateLevelColor = "#FECD2F",
  highLevelColor = "#E98600",
  veryHighLevelColor = "#DE3E2A",
  extrameLevelColor = "#9161C9",
  currentColor = "#98D600";

let lowLevelcolorPercent = 2/11,
  moderateLevelColorPercent = 5/11,
  highLevelColorPercent = 7/11,
  veryHighLevelColorPercent = 10/11,
  extrameLevelColorPercent = 11/11;

function drawWave(time, percent) {
  let stopPercentage = percent
  waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height); // Clear previous frame

  // calculate the threshold positions in pixels based on the current canvas size
  let lowLevelY = waveCanvas.height * lowLevelcolorPercent,
    moderateLevelY = waveCanvas.height * moderateLevelColorPercent,
    highLevelY = waveCanvas.height * highLevelColorPercent,
    veryHighLevelY = waveCanvas.height * veryHighLevelColorPercent,
    extrameLevelY = waveCanvas.height * extrameLevelColorPercent;

  // console.log("lowLevelY: " + lowLevelY)
  // console.log("moderateLevelY: " + moderateLevelY)
  // console.log("highLevelY: " + highLevelY)
  // console.log("veryHighLevelY: " + veryHighLevelY)
  // console.log("extrameLevelY: " + extrameLevelY)

  // console.log("waveY:" + waveY)

  let waveYforColor = waveCanvas.height - waveY;

  // change the color when passing the threshold
  if (waveYforColor <= lowLevelY) {
    currentColor = lowLevelColor;
  } else if (waveYforColor <= moderateLevelY) {
    currentColor = moderateLevelColor;
  } else if (waveYforColor <= highLevelY) {
    currentColor = highLevelColor;
  } else if (waveYforColor <= veryHighLevelY) {
    currentColor = veryHighLevelColor;
  } else {
    currentColor = extrameLevelColor;
  }

  waveCtx.fillStyle = currentColor;  // Color of the wave
  waveCtx.beginPath();

  // Draw wave using sine function
  waveCtx.moveTo(0, waveY);
  for (let x = 0; x <= waveCanvas.width; x++) {
    let y = waveAmplitude * Math.sin(x * waveFrequency + wavePhase);
    waveCtx.lineTo(x, waveY + y);
  }
  waveCtx.lineTo(waveCanvas.width, waveCanvas.height);
  waveCtx.lineTo(0, waveCanvas.height);
  waveCtx.closePath();
  waveCtx.fill();

  // Move the wave upwards
  let stopPosition = waveCanvas.height * stopPercentage;
  if (waveY > stopPosition) {
    waveY -= waveSpeed;  // Rising effect
  }

  // Update wave phase for animation (move wave left-right)
  wavePhase += 0.05;
}


// Quadratic easing for smoother fall (simulating gravity)
function easeOutQuad(t) {
  return t * (2 - t); // Eases the motion, making it slower as it approaches the end
}

function animate(time) {
  requestAnimationFrame(animate);

  if (object && !bottleDropped) {
    let distanceToTarget = object.position.y - bottleTargetY;
    if (distanceToTarget > 0.01) {
      let easingFactor = easeOutQuad(distanceToTarget / (bottleInitialY - bottleTargetY));
      object.position.y -= easingFactor * dropSpeed; // Apply easing to the drop speed
    } else {
      bottleDropped = true; // Bottle has reached the ground
    }
  }


  // Draw the wave

  renderer.render(scene, camera);


  if (mainDiv.innerText !== "") {
    let percent = 1 - (mainDiv.innerText) / 11;
    // console.log("percent: " + percent);
    drawWave(time, percent);
  }
}

window.addEventListener("resize", function () {
  waveCanvas.width = window.innerWidth;
  waveCanvas.height = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//Start the 3D rendering
animate();
