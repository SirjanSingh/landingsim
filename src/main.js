import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Terrain } from './terrain.js';
import { Spacecraft } from './spacecraft.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';
import { AudioManager } from './audio.js';
import { ParticleSystem } from './particles.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    static async create() {
        const game = new Game();
        
        try {
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.style.position = 'fixed';
            loadingDiv.style.top = '50%';
            loadingDiv.style.left = '50%';
            loadingDiv.style.transform = 'translate(-50%, -50%)';
            loadingDiv.style.padding = '20px';
            loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingDiv.style.color = 'white';
            loadingDiv.style.borderRadius = '5px';
            loadingDiv.style.zIndex = '1000';
            loadingDiv.textContent = 'Initializing physics engine...';
            document.body.appendChild(loadingDiv);

            // Initialize game components
            game.setupLighting();
            game.setupCamera();
            await game.initializeComponents();
            game.setupEventListeners();

            // Remove loading indicator
            document.body.removeChild(loadingDiv);

            // Start the game loop
            game.animate();
            
            return game;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            // Display error to user
            const errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '50%';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translate(-50%, -50%)';
            errorDiv.style.padding = '20px';
            errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            errorDiv.style.color = 'white';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.zIndex = '1000';
            errorDiv.textContent = 'Failed to initialize physics engine. Please refresh the page.';
            document.body.appendChild(errorDiv);
            throw error;
        }
    }

    async initializeComponents() {
        try {
            // Initialize physics first
            this.physics = new Physics();
            await this.physics.init();

            // Initialize other components
            this.terrain = new Terrain(this.scene, this.physics);
            this.spacecraft = new Spacecraft(this.scene, this.physics);
            this.ui = new UI(this.spacecraft);
            this.audio = new AudioManager();
            this.particles = new ParticleSystem(this.scene);
            
            // Connect particle system to spacecraft
            this.spacecraft.setParticleSystem(this.particles);

            // Set initial camera position
            this.camera.position.set(0, 100, 200);
            this.camera.lookAt(this.spacecraft.mesh.position);

            // Setup orbit controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 50;
            this.controls.maxDistance = 500;
        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw error;
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);

        // Add subtle blue atmospheric glow
        const hemisphereLight = new THREE.HemisphereLight(0x0044ff, 0xffffff, 0.3);
        this.scene.add(hemisphereLight);
    }

    setupCamera() {
        this.camera.position.set(0, 100, 200);
        this.camera.lookAt(0, 0, 0);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Camera view toggle
        window.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                this.toggleCameraView();
            }
        });
    }

    toggleCameraView() {
        // Toggle between orbit and cockpit view
        if (this.controls.enabled) {
            // Switch to cockpit view
            this.controls.enabled = false;
            this.camera.position.copy(this.spacecraft.getCockpitPosition());
            this.camera.lookAt(this.spacecraft.getForwardDirection());
        } else {
            // Switch to orbit view
            this.controls.enabled = true;
            this.camera.position.set(0, 100, 200);
            this.controls.target.copy(this.spacecraft.mesh.position);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(1 / 60, 0.1);

        // Update physics
        this.physics.update(delta);

        // Update game components
        if (this.spacecraft) {
            this.spacecraft.update(delta);
            this.ui.update();
            this.particles.update(delta);
        }

        // Update camera if in cockpit view
        if (!this.controls.enabled) {
            this.camera.position.copy(this.spacecraft.getCockpitPosition());
            this.camera.lookAt(this.spacecraft.getForwardDirection());
        }

        // Update controls and render
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the window loads
window.addEventListener('load', async () => {
    await Game.create();
}); 