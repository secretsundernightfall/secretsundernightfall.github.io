// Import necessary components from Three.js
import * as THREE from 'three';
// Import OrbitControls for basic camera manipulation (useful for debugging)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Game Variables ---
let scene, camera, renderer;
let floor, wall1, wall2, wall3, wall4, ceiling; // Basic level geometry
let controls; // Camera controls
let animationFrameId = null; // To control the animation loop
let gameIsActive = false;

const canvas = document.getElementById('game-canvas');

// --- Initialization Function (called by menu script) ---
function initGame(chamberId) {
    console.log(`Initializing game for Chamber ${chamberId}...`);

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233); // Dark blue/purple background
    scene.fog = new THREE.Fog(0x222233, 10, 30); // Add subtle fog

    // 2. Camera setup
    const aspect = 4 / 3; // Enforce 4:3 aspect ratio
    const fov = 75; // Field of View
    const near = 0.1; // Near clipping plane
    const far = 100; // Far clipping plane
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1.6, 5); // Place camera slightly above ground, looking forward
    camera.lookAt(0, 1, 0); // Look towards the center of the room base

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true // Smoother edges
    });
    // Set size initially, will be updated by resize handler
    updateRendererSize();

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Simulate sunlight
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 5. Create Level Geometry (Basic Room)
    createLevelGeometry();

    // 6. Controls (OrbitControls for now to look around)
    // Later replace with FirstPersonControls (PointerLockControls)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0); // Point controls towards center
    controls.enableDamping = true; // Smooths movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Keep panning relative to ground plane
    controls.minDistance = 1;
    controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI / 2; // Prevent looking below floor

    // 7. Resize Listener
    window.addEventListener('resize', onWindowResize);

    // 8. Make game control functions available globally (or via a game object)
    window.currentGame = {
        start: startGameLoop,
        stop: stopGameLoop,
        isActive: gameIsActive
    };

    console.log("Three.js scene initialized.");
    // Note: We don't start the animation loop here, showScreen('game') will do it.
}

// --- Create basic room geometry ---
function createLevelGeometry() {
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, // Light grey
        roughness: 0.8,
        metalness: 0.2
    });
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x666677, // Darker blue/grey
        roughness: 0.9,
        metalness: 0.1
    });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10); // Width, Height
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate plane to be horizontal
    floor.position.y = 0;           // Position at ground level
    scene.add(floor);

    // Walls (simple boxes)
    const wallHeight = 3;
    const wallThickness = 0.2;
    const roomSize = 10; // Matches floor size

    // Wall -Z (Back)
    const wall1Geometry = new THREE.BoxGeometry(roomSize, wallHeight, wallThickness);
    wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
    wall1.position.set(0, wallHeight / 2, -roomSize / 2);
    scene.add(wall1);

    // Wall +Z (Front - behind camera start)
    const wall2Geometry = new THREE.BoxGeometry(roomSize, wallHeight, wallThickness);
    wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
    wall2.position.set(0, wallHeight / 2, roomSize / 2);
    scene.add(wall2);

    // Wall -X (Left)
    const wall3Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomSize);
    wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
    wall3.position.set(-roomSize / 2, wallHeight / 2, 0);
    scene.add(wall3);

    // Wall +X (Right)
    const wall4Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomSize);
    wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
    wall4.position.set(roomSize / 2, wallHeight / 2, 0);
    scene.add(wall4);

    // Ceiling (optional, copy of floor)
    ceiling = new THREE.Mesh(floorGeometry, wallMaterial); // Use wall color for ceiling
    ceiling.rotation.x = Math.PI / 2; // Rotate opposite of floor
    ceiling.position.y = wallHeight;
    scene.add(ceiling);

     // Simple Cube (like a companion cube placeholder?)
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff88aa }); // Pinkish
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.25, 0); // Place on the floor in the center
    scene.add(cube);
}


// --- Game Loop ---
function animate() {
    if (!gameIsActive) return; // Stop loop if game is not active

    animationFrameId = requestAnimationFrame(animate); // Request next frame

    // Update controls (for damping effect)
    controls.update();

    // Update game logic here later (player movement, physics, etc.)

    // Render the scene
    renderer.render(scene, camera);
}

// --- Start/Stop Controls ---
function startGameLoop() {
    if (!animationFrameId) { // Prevent multiple loops
        gameIsActive = true;
        if(window.currentGame) window.currentGame.isActive = true;
        animate();
        console.log("Game loop started.");
    }
}

function stopGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        gameIsActive = false;
         if(window.currentGame) window.currentGame.isActive = false;
        console.log("Game loop stopped.");
    }
}

// --- Handle Window Resizing ---
function onWindowResize() {
    updateRendererSize();

    // Update camera aspect ratio
    camera.aspect = 4 / 3; // Keep it fixed
    camera.updateProjectionMatrix(); // Apply changes
}

// --- Update Renderer Size based on Container ---
function updateRendererSize() {
     // Get the container size (which is constrained by CSS)
    const container = document.getElementById('game-view');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Update renderer size
    renderer.setSize(width, height);
    // Set pixel ratio for sharper images on high DPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}


// --- Make initGame globally accessible ---
window.initGame = initGame;

// --- Initial setup call for debugging (optional) ---
// If you want to bypass the menu for testing:
// document.addEventListener('DOMContentLoaded', () => {
//    initGame('debug_chamber');
//    const gameView = document.getElementById('game-view');
//    gameView.classList.remove('hidden'); // Manually show game view
//    startGameLoop(); // Manually start loop
// });


