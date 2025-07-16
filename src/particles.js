import * as THREE from '/node_modules/three/build/three.module.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGroups = new Map();
    }

    createParticle(position, options = {}) {
        const {
            color = 0xffff00,
            size = 0.5,
            lifetime = 1,
            velocity = new THREE.Vector3(0, 0, 0),
            acceleration = new THREE.Vector3(0, -9.81, 0),
            opacity = 1,
            fadeOut = true
        } = options;

        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        const particle = {
            mesh: new THREE.Mesh(geometry, material),
            velocity: velocity.clone(),
            acceleration: acceleration.clone(),
            lifetime: lifetime,
            age: 0,
            fadeOut: fadeOut,
            initialOpacity: opacity
        };

        particle.mesh.position.copy(position);
        this.scene.add(particle.mesh);
        this.particles.push(particle);

        return particle;
    }

    createThrusterEffect(position, direction) {
        const group = [];
        const numParticles = 12; // More particles for a fuller effect

        // Create a basis for the spread calculation
        const up = direction.clone().negate(); // Base direction (up relative to thruster)
        const right = new THREE.Vector3();
        const forward = new THREE.Vector3();
        
        // Create orthogonal vectors for spread calculation
        if (Math.abs(up.y) < 0.99) {
            right.crossVectors(up, new THREE.Vector3(0, 1, 0)).normalize();
        } else {
            right.crossVectors(up, new THREE.Vector3(1, 0, 0)).normalize();
        }
        forward.crossVectors(right, up).normalize();

        for (let i = 0; i < numParticles; i++) {
            const spread = 0.4; // Increased spread for wider flames
            
            // Calculate spread direction using the basis vectors
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadRadius = Math.random() * spread;
            const spreadDir = right.clone().multiplyScalar(Math.cos(spreadAngle) * spreadRadius)
                .add(forward.clone().multiplyScalar(Math.sin(spreadAngle) * spreadRadius));

            // Calculate velocity
            const speed = -(4 + Math.random() * 6);
            const velocity = up.clone().multiplyScalar(speed).add(spreadDir);

            // Create color gradient from white/yellow core to orange/red outer
            const color = new THREE.Color();
            const t = Math.random();
            if (t < 0.3) {
                color.setHex(0xffffff); // White hot core
            } else if (t < 0.6) {
                color.setHex(0xffff00); // Yellow
            } else if (t < 0.8) {
                color.setHex(0xff8800); // Orange
            } else {
                color.setHex(0xff4400); // Red-orange
            }

            const particle = this.createParticle(position, {
                color: color,
                size: 0.3 + Math.random() * 0.4, // Larger particles
                lifetime: 0.3 + Math.random() * 0.4, // Longer lifetime for longer flames
                velocity: velocity,
                opacity: 0.9 + Math.random() * 0.1, // Higher base opacity
                acceleration: up.clone().multiplyScalar(-8) // Stronger upward acceleration
            });

            group.push(particle);
        }

        // Add some smoke particles with corrected direction
        const numSmoke = 4;
        for (let i = 0; i < numSmoke; i++) {
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadRadius = Math.random() * 0.6;
            const spreadDir = right.clone().multiplyScalar(Math.cos(spreadAngle) * spreadRadius)
                .add(forward.clone().multiplyScalar(Math.sin(spreadAngle) * spreadRadius));

            const speed = -(2 + Math.random() * 3);
            const velocity = up.clone().multiplyScalar(speed).add(spreadDir);

            const particle = this.createParticle(position, {
                color: 0x888888, // Gray smoke
                size: 0.4 + Math.random() * 0.6, // Large smoke particles
                lifetime: 0.5 + Math.random() * 0.3, // Longer lifetime for smoke
                velocity: velocity,
                opacity: 0.2 + Math.random() * 0.1, // Low opacity for smoke
                acceleration: up.clone().multiplyScalar(-2), // Gentle upward drift
                fadeOut: true
            });

            group.push(particle);
        }

        return group;
    }

    createExplosion(position, scale = 1) {
        const group = [];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * speed,
                Math.sin(angle) * speed
            );

            const color = new THREE.Color();
            color.setHSL(0.1, 1, 0.5 + Math.random() * 0.5);

            const particle = this.createParticle(position, {
                color: color,
                size: (0.3 + Math.random() * 0.7) * scale,
                lifetime: 1 + Math.random(),
                velocity: velocity,
                opacity: 0.8
            });

            group.push(particle);
        }

        // Add smoke particles
        for (let i = 0; i < numParticles / 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * speed * 2,
                Math.sin(angle) * speed
            );

            const particle = this.createParticle(position, {
                color: 0x444444,
                size: (0.5 + Math.random()) * scale,
                lifetime: 2 + Math.random(),
                velocity: velocity,
                opacity: 0.3,
                acceleration: new THREE.Vector3(0, -1, 0)
            });

            group.push(particle);
        }

        return group;
    }

    createDustEffect(position, scale = 1) {
        const group = [];
        const numParticles = 20;

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2 * scale;
            const particlePos = new THREE.Vector3(
                position.x + Math.cos(angle) * radius,
                position.y,
                position.z + Math.sin(angle) * radius
            );

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );

            const particle = this.createParticle(particlePos, {
                color: 0xcccccc,
                size: 0.2 + Math.random() * 0.3,
                lifetime: 1 + Math.random(),
                velocity: velocity,
                opacity: 0.3,
                acceleration: new THREE.Vector3(0, -0.5, 0)
            });

            group.push(particle);
        }

        return group;
    }

    update(deltaTime) {
        // Update and remove dead particles
        this.particles = this.particles.filter(particle => {
            particle.age += deltaTime;

            if (particle.age >= particle.lifetime) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                return false;
            }

            // Update position
            particle.velocity.add(particle.acceleration.clone().multiplyScalar(deltaTime));
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            // Update opacity for fade out
            if (particle.fadeOut) {
                const lifeRatio = 1 - (particle.age / particle.lifetime);
                particle.mesh.material.opacity = particle.initialOpacity * lifeRatio;
            }

            return true;
        });
    }

    clear() {
        this.particles.forEach(particle => {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        });
        this.particles = [];
    }
} 