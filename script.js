// Create scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f0f11');
scene.fog = new THREE.FogExp2('#0f0f11', 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -6, 20); // slight angle for better initial 3D perspective

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 35;

// Lighting setup for premium look
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
dirLight.position.set(10, 10, 15);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const pointLight1 = new THREE.PointLight(0xd4af37, 1.2, 30);
pointLight1.position.set(-8, 8, 8);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x55aaff, 0.6, 30);
pointLight2.position.set(8, -8, 8);
scene.add(pointLight2);

// Clock Group to hold all parts
const clockGroup = new THREE.Group();
clockGroup.rotation.x = -0.15; // slightly tilted up
scene.add(clockGroup);

// Premium Materials
const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.15,
});

const silverMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.8,
    roughness: 0.25,
});

const dialMaterial = new THREE.MeshStandardMaterial({
    color: 0x111115,
    metalness: 0.6,
    roughness: 0.7,
});

const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    metalness: 0.4,
    roughness: 0.3,
});

const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.3,
});

// Main Outer Frame
const frameGeometry = new THREE.TorusGeometry(4.2, 0.4, 64, 128);
const frame = new THREE.Mesh(frameGeometry, goldMaterial);
frame.castShadow = true;
frame.receiveShadow = true;
clockGroup.add(frame);

// Inner Decorative Ring
const innerFrameGeo = new THREE.TorusGeometry(3.85, 0.06, 32, 128);
const innerFrame = new THREE.Mesh(innerFrameGeo, silverMaterial);
innerFrame.position.z = 0.1;
innerFrame.castShadow = true;
clockGroup.add(innerFrame);

// Dial Base (The face of the clock)
const dialGeometry = new THREE.CylinderGeometry(4.0, 4.0, 0.2, 64);
const dial = new THREE.Mesh(dialGeometry, dialMaterial);
dial.rotation.x = Math.PI / 2;
dial.position.z = -0.1;
dial.receiveShadow = true;
clockGroup.add(dial);

// Add Hour/Minute Markings
for (let i = 0; i < 60; i++) {
    const isQuarter = i % 15 === 0;
    const isHour = i % 5 === 0;
    
    let w, h, d, mat;
    if (isQuarter) {
        w = 0.15; h = 0.8; d = 0.12; mat = goldMaterial;
    } else if (isHour) {
        w = 0.1; h = 0.5; d = 0.1; mat = silverMaterial;
    } else {
        w = 0.04; h = 0.2; d = 0.06; mat = whiteMaterial;
    }
    
    const markGeo = new THREE.BoxGeometry(w, h, d);
    const mark = new THREE.Mesh(markGeo, mat);
    
    const angle = (i / 60) * Math.PI * 2;
    const radius = 3.4;
    
    mark.position.x = Math.sin(angle) * radius;
    mark.position.y = Math.cos(angle) * radius;
    mark.rotation.z = -angle;
    mark.position.z = d / 2; // place on top of dial
    
    mark.castShadow = true;
    mark.receiveShadow = true;
    clockGroup.add(mark);
}

// Center Pin/Axis
const pinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 32);
const pin = new THREE.Mesh(pinGeo, goldMaterial);
pin.rotation.x = Math.PI / 2;
pin.position.z = 0.2;
pin.castShadow = true;
clockGroup.add(pin);

const innerPinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 32);
const innerPin = new THREE.Mesh(innerPinGeo, silverMaterial);
innerPin.rotation.x = Math.PI / 2;
innerPin.position.z = 0.25;
innerPin.castShadow = true;
clockGroup.add(innerPin);

// Glass Cover
const glassGeometry = new THREE.CylinderGeometry(4.0, 4.0, 0.05, 64);
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.9,
    opacity: 1,
    metalness: 0.1,
    roughness: 0.05,
    ior: 1.5,
    thickness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});
// const glass = new THREE.Mesh(glassGeometry, glassMaterial);
// glass.rotation.x = Math.PI / 2;
// glass.position.z = 0.6; // Hovering above the hands
// clockGroup.add(glass);

// Helper function to create hands
function createHand(width, length, depth, colorMat, zPos, offset) {
    const geo = new THREE.BoxGeometry(width, length, depth);
    // Move pivot point
    geo.translate(0, length / 2 - offset, 0);
    const mesh = new THREE.Mesh(geo, colorMat);
    mesh.position.z = zPos;
    mesh.castShadow = true;
    clockGroup.add(mesh);
    return mesh;
}

// Create the three hands
const hourHand = createHand(0.15, 2.0, 0.06, silverMaterial, 0.15, 0.3);
const minuteHand = createHand(0.1, 3.2, 0.05, silverMaterial, 0.25, 0.4);
const secondHand = createHand(0.04, 3.6, 0.04, redMaterial, 0.35, 0.8);

// Main Animation Loop
function animate() {
    requestAnimationFrame(animate);

    const date = new Date();
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();

    // Smooth continuous movement for realistic feeling
    const sRotation = -(seconds + ms / 1000) * (Math.PI * 2 / 60);
    const mRotation = -(minutes + seconds / 60 + ms / 60000) * (Math.PI * 2 / 60);
    const hRotation = -(hours + minutes / 60 + seconds / 3600) * (Math.PI * 2 / 12);

    secondHand.rotation.z = sRotation;
    minuteHand.rotation.z = mRotation;
    hourHand.rotation.z = hRotation;

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the clock
animate();
