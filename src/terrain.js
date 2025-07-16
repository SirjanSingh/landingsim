import * as THREE from '/node_modules/three/build/three.module.js';
import { createNoise2D } from 'simplex-noise';

export class Terrain {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.size = 1000; // Terrain size
        this.resolution = 128; // Grid resolution
        this.maxHeight = 50; // Maximum terrain height
        
        this.generateTerrain();
    }

    generateTerrain() {
        // Create noise generator
        const noise2D = createNoise2D();
        
        // Generate height data
        const heightData = new Float32Array(this.resolution * this.resolution);
        const scale = 3;
        const octaves = 6;
        const persistence = 0.5;
        const lacunarity = 2.0;

        for (let i = 0; i < this.resolution; i++) {
            for (let j = 0; j < this.resolution; j++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseHeight = 0;

                // Generate multiple octaves of noise
                for (let o = 0; o < octaves; o++) {
                    const sampleX = (i / this.resolution) * scale * frequency;
                    const sampleY = (j / this.resolution) * scale * frequency;
                    
                    noiseHeight += noise2D(sampleX, sampleY) * amplitude;
                    
                    amplitude *= persistence;
                    frequency *= lacunarity;
                }

                // Add craters
                noiseHeight = this.addCraters(i, j, noiseHeight);
                
                // Store the height value
                heightData[i * this.resolution + j] = noiseHeight * this.maxHeight;
            }
        }

        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.resolution - 1,
            this.resolution - 1
        );
        geometry.rotateX(-Math.PI / 2);

        // Apply height data to vertices
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 1] = heightData[i / 3];
        }
        geometry.computeVertexNormals();

        // Create terrain material
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
        });

        // Create terrain mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Create physics shape for terrain
        const terrainShape = this.physics.createTerrainShape(
            heightData,
            this.resolution,
            this.resolution,
            this.maxHeight / this.resolution
        );

        // Create rigid body for terrain
        this.physics.createRigidBody(
            this.mesh,
            0, // Mass of 0 makes it static
            terrainShape,
            { x: 0, y: -this.maxHeight / 2, z: 0 },
            { x: 0, y: 0, z: 0, w: 1 }
        );

        // Add surface details
        this.addSurfaceDetails();
    }

    addCraters(x, y, height) {
        const craters = [
            { x: 0.3, y: 0.7, radius: 0.1, depth: 0.3 },
            { x: 0.7, y: 0.2, radius: 0.15, depth: 0.4 },
            { x: 0.5, y: 0.5, radius: 0.2, depth: 0.5 }
        ];

        const px = x / this.resolution;
        const py = y / this.resolution;

        for (const crater of craters) {
            const dx = px - crater.x;
            const dy = py - crater.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < crater.radius) {
                const craterDepth = (1 - (distance / crater.radius)) * crater.depth;
                height -= craterDepth;

                // Add crater rim
                if (distance > crater.radius * 0.8) {
                    const rimHeight = (1 - (distance / crater.radius)) * 0.2;
                    height += rimHeight;
                }
            }
        }

        return height;
    }

    addSurfaceDetails() {
        // Add rocks
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9
        });

        for (let i = 0; i < 100; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            const x = (Math.random() - 0.5) * this.size * 0.8;
            const z = (Math.random() - 0.5) * this.size * 0.8;
            
            // Find height at this position
            const heightIndex = Math.floor((x / this.size + 0.5) * (this.resolution - 1));
            const depthIndex = Math.floor((z / this.size + 0.5) * (this.resolution - 1));
            const height = this.mesh.geometry.attributes.position.array[
                (heightIndex * this.resolution + depthIndex) * 3 + 1
            ];

            rock.position.set(x, height, z);
            rock.scale.set(
                2 + Math.random() * 3,
                2 + Math.random() * 3,
                2 + Math.random() * 3
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    getHeightAtPosition(x, z) {
        // Convert world coordinates to terrain coordinates
        const terrainX = ((x / this.size) + 0.5) * (this.resolution - 1);
        const terrainZ = ((z / this.size) + 0.5) * (this.resolution - 1);

        // Get the four corners of the terrain square
        const x1 = Math.floor(terrainX);
        const x2 = Math.ceil(terrainX);
        const z1 = Math.floor(terrainZ);
        const z2 = Math.ceil(terrainZ);

        // Get the heights at the four corners
        const h11 = this.mesh.geometry.attributes.position.array[(x1 * this.resolution + z1) * 3 + 1];
        const h21 = this.mesh.geometry.attributes.position.array[(x2 * this.resolution + z1) * 3 + 1];
        const h12 = this.mesh.geometry.attributes.position.array[(x1 * this.resolution + z2) * 3 + 1];
        const h22 = this.mesh.geometry.attributes.position.array[(x2 * this.resolution + z2) * 3 + 1];

        // Bilinear interpolation
        const fx = terrainX - x1;
        const fz = terrainZ - z1;

        const h1 = h11 * (1 - fx) + h21 * fx;
        const h2 = h12 * (1 - fx) + h22 * fx;

        return h1 * (1 - fz) + h2 * fz;
    }
} 