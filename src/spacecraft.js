import * as THREE from 'three';

// Import Ammo.js dynamically
let Ammo = null;

export class Spacecraft {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.fuel = 1000;
        this.thrustPower = 500;
        this.rotationSpeed = 2;
        this.isDamaged = false;
        this.isLanded = false;
        this.thrusterPositions = []; // Store thruster positions

        // Get the Ammo instance from the physics engine
        Ammo = physics.getAmmo();
        
        this.createSpacecraft();
        this.setupControls();
    }

    createSpacecraft() {
        // Create the main body
        const bodyGeometry = new THREE.CylinderGeometry(2, 3, 8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.8,
            roughness: 0.2
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Add legs
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.5,
            roughness: 0.5
        });

        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            const angle = (i / 4) * Math.PI * 2;
            leg.position.set(
                Math.cos(angle) * 2.5,
                -4,
                Math.sin(angle) * 2.5
            );
            leg.rotation.x = Math.PI / 6;
            leg.rotation.z = -angle;
            this.mesh.add(leg);
        }

        // Add thrusters
        const thrusterGeometry = new THREE.CylinderGeometry(0.5, 1, 1, 8);
        const thrusterMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.7,
            roughness: 0.3
        });

        for (let i = 0; i < 3; i++) {
            const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
            const angle = (i / 3) * Math.PI * 2;
            const x = Math.cos(angle) * 1.5;
            const z = Math.sin(angle) * 1.5;
            thruster.position.set(x, -4, z);
            this.mesh.add(thruster);
            
            // Store thruster position for particle effects
            this.thrusterPositions.push(new THREE.Vector3(x, -4.5, z));
        }

        // Add cockpit
        const cockpitGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x4444ff,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.y = 2;
        this.mesh.add(cockpit);

        // Set initial position
        this.mesh.position.set(0, 100, 0);
        this.scene.add(this.mesh);

        // Create physics body
        const shape = new Ammo.btCylinderShape(
            new Ammo.btVector3(2, 4, 2)
        );
        this.body = this.physics.createRigidBody(
            this.mesh,
            100, // Mass
            shape,
            this.mesh.position,
            this.mesh.quaternion
        );

        // Set up physics properties
        this.body.setDamping(0, 0.5); // Remove linear damping completely, keep angular damping for control
        this.body.setFriction(0.5);
        this.body.setRestitution(0.3);
        
        // Disable deactivation so the body never goes to sleep
        this.body.setActivationState(4); // DISABLE_DEACTIVATION
    }

    setupControls() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            thrust: false,
            roll_left: false,
            roll_right: false
        };

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.thrust = true;
                break;
            case 'q':
                this.keys.roll_left = true;
                break;
            case 'e':
                this.keys.roll_right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.thrust = false;
                break;
            case 'q':
                this.keys.roll_left = false;
                break;
            case 'e':
                this.keys.roll_right = false;
                break;
        }
    }

    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
    }

    update(deltaTime) {
        if (this.isDamaged) return;

        // Apply thrust
        if (this.keys.thrust && this.fuel > 0) {
            const thrustVector = new THREE.Vector3(0, 1, 0);
            thrustVector.applyQuaternion(this.mesh.quaternion);
            thrustVector.multiplyScalar(this.thrustPower);

            this.physics.applyForce(
                this.mesh.uuid,
                thrustVector,
                { x: 0, y: 0, z: 0 }
            );

            // Create thruster effects
            if (this.particleSystem) {
                this.thrusterPositions.forEach(localPos => {
                    // Convert local thruster position to world position
                    const worldPos = localPos.clone()
                        .applyQuaternion(this.mesh.quaternion)
                        .add(this.mesh.position);
                    
                    // Get the spacecraft's down direction in world space
                    // This ensures flames always come from the bottom of the spacecraft
                    const localDown = new THREE.Vector3(0, -1, 0);
                    const worldDown = localDown.clone().applyQuaternion(this.mesh.quaternion);
                    
                    // Offset the emission point slightly downward to prevent clipping
                    const emissionOffset = worldDown.clone().multiplyScalar(0.5);
                    const emissionPoint = worldPos.clone().add(emissionOffset);
                    
                    this.particleSystem.createThrusterEffect(emissionPoint, worldDown);
                });
            }

            // Reduce fuel
            this.fuel = Math.max(0, this.fuel - deltaTime * 10);
        }

        // Apply rotation
        const rotation = new THREE.Euler();
        if (this.keys.forward) rotation.x -= this.rotationSpeed * deltaTime;
        if (this.keys.backward) rotation.x += this.rotationSpeed * deltaTime;
        if (this.keys.left) rotation.y -= this.rotationSpeed * deltaTime;
        if (this.keys.right) rotation.y += this.rotationSpeed * deltaTime;
        if (this.keys.roll_left) rotation.z += this.rotationSpeed * deltaTime;
        if (this.keys.roll_right) rotation.z -= this.rotationSpeed * deltaTime;

        // Apply rotation to physics body
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(rotation);
        this.body.applyTorqueImpulse(
            new Ammo.btVector3(
                rotation.x * 100,
                rotation.y * 100,
                rotation.z * 100
            )
        );

        // Check landing/crash conditions
        this.checkLandingConditions();
    }

    checkLandingConditions() {
        const velocity = this.physics.getLinearVelocity(this.mesh.uuid);
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
        const rotation = new THREE.Euler().setFromQuaternion(this.mesh.quaternion);
        const tiltAngle = Math.max(Math.abs(rotation.x), Math.abs(rotation.z));

        // Check if near ground
        if (this.mesh.position.y < 10) {
            if (speed > 10 || tiltAngle > Math.PI / 6) {
                this.crash();
            } else if (speed < 2 && tiltAngle < Math.PI / 12) {
                this.land();
            }
        }
    }

    crash() {
        if (!this.isDamaged) {
            this.isDamaged = true;
            // Trigger explosion effect and game over
            document.dispatchEvent(new CustomEvent('spacecraft-crashed'));
        }
    }

    land() {
        if (!this.isLanded) {
            this.isLanded = true;
            // Trigger landing success
            document.dispatchEvent(new CustomEvent('spacecraft-landed'));
        }
    }

    getCockpitPosition() {
        const cockpitPos = new THREE.Vector3(0, 2, 0);
        cockpitPos.applyMatrix4(this.mesh.matrixWorld);
        return cockpitPos;
    }

    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.mesh.quaternion);
        forward.add(this.mesh.position);
        return forward;
    }

    reset() {
        this.isDamaged = false;
        this.isLanded = false;
        this.fuel = 100;
        this.mesh.position.set(0, 100, 0);
        this.mesh.quaternion.set(0, 0, 0, 1);
        this.physics.setLinearVelocity(this.mesh.uuid, { x: 0, y: 0, z: 0 });
    }
} 