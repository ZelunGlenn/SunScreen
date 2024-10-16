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
            document.getElementById('mainDiv').innerText = data.severity
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


//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let object

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
//
let objToRender = 'eye';

const loader = new GLTFLoader();

