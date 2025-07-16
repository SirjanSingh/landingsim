// Import Ammo.js dynamically
let Ammo = null;

export class Physics {
    constructor() {
        // Initialize physics properties
        this.objects = new Map(); // Store physics objects
        this.gravity = -1.62;     // Moon's gravity (m/s²)
        this.timeStep = 1 / 120;  // Increased physics update rate for more accuracy
        this.maxSubSteps = 4;     // Increased maximum physics substeps
    }

    async init() {
        try {
            // Load and initialize Ammo.js
            if (!Ammo) {
                Ammo = await import('ammojs-typed');
                Ammo = await Ammo.default();
            }
            
            // Create collision configuration
            this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
            
            // Create broadphase
            this.broadphase = new Ammo.btDbvtBroadphase();
            
            // Create solver
            this.solver = new Ammo.btSequentialImpulseConstraintSolver();
            
            // Create physics world
            this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
                this.dispatcher,
                this.broadphase,
                this.solver,
                this.collisionConfiguration
            );

            // Set gravity
            const gravity = new Ammo.btVector3(0, this.gravity, 0);
            this.physicsWorld.setGravity(gravity);

            return true;
        } catch (error) {
            console.error('Failed to initialize physics:', error);
            return false;
        }
    }

    // Get the initialized Ammo instance
    getAmmo() {
        return Ammo;
    }

    createRigidBody(mesh, mass, shape, position, rotation) {
        try {
            // Create transform
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
            transform.setRotation(new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w));

            // Set up motion state
            const motionState = new Ammo.btDefaultMotionState(transform);
            
            // Calculate inertia
            const localInertia = new Ammo.btVector3(0, 0, 0);
            if (mass > 0) {
                shape.calculateLocalInertia(mass, localInertia);
            }

            // Create rigid body info
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia
            );

            // Create rigid body
            const body = new Ammo.btRigidBody(rbInfo);

            // Store the object
            this.objects.set(mesh.uuid, { mesh, body });

            // Add body to world
            this.physicsWorld.addRigidBody(body);

            return body;
        } catch (error) {
            console.error('Failed to create rigid body:', error);
            return null;
        }
    }

    createTerrainShape(heightData, width, length, heightScale = 1) {
        try {
            // Create heightfield terrain shape
            const terrainShape = new Ammo.btHeightfieldTerrainShape(
                width,          // Width of heightfield
                length,         // Length of heightfield
                heightData,     // Height data
                heightScale,    // Height scaling
                -1000,         // Min height
                1000,          // Max height
                1,             // Up axis (1 = y)
                "PHY_FLOAT",   // Height data type
                false          // Flip quad edges
            );

            // Set local scaling
            const scaling = new Ammo.btVector3(1, 1, 1);
            terrainShape.setLocalScaling(scaling);

            return terrainShape;
        } catch (error) {
            console.error('Failed to create terrain shape:', error);
            return null;
        }
    }

    applyForce(uuid, force, relativePos = { x: 0, y: 0, z: 0 }) {
        const obj = this.objects.get(uuid);
        if (obj) {
            const forceVec = new Ammo.btVector3(force.x, force.y, force.z);
            const pos = new Ammo.btVector3(relativePos.x, relativePos.y, relativePos.z);
            obj.body.applyForce(forceVec, pos);
        }
    }

    applyImpulse(uuid, impulse, relativePos = { x: 0, y: 0, z: 0 }) {
        const obj = this.objects.get(uuid);
        if (obj) {
            const impulseVec = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);
            const pos = new Ammo.btVector3(relativePos.x, relativePos.y, relativePos.z);
            obj.body.applyImpulse(impulseVec, pos);
        }
    }

    setLinearVelocity(uuid, velocity) {
        const obj = this.objects.get(uuid);
        if (obj) {
            const vel = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
            obj.body.setLinearVelocity(vel);
        }
    }

    getLinearVelocity(uuid) {
        const obj = this.objects.get(uuid);
        if (obj) {
            const vel = obj.body.getLinearVelocity();
            return {
                x: vel.x(),
                y: vel.y(),
                z: vel.z()
            };
        }
        return { x: 0, y: 0, z: 0 };
    }

    update(deltaTime) {
        // Step physics simulation
        this.physicsWorld.stepSimulation(deltaTime, this.maxSubSteps, this.timeStep);

        // Update object positions
        this.objects.forEach((obj) => {
            const ms = obj.body.getMotionState();
            if (ms) {
                const transform = new Ammo.btTransform();
                ms.getWorldTransform(transform);

                const pos = transform.getOrigin();
                const quat = transform.getRotation();

                // Update Three.js mesh
                obj.mesh.position.set(pos.x(), pos.y(), pos.z());
                obj.mesh.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
            }
        });
    }

    removeBody(uuid) {
        const obj = this.objects.get(uuid);
        if (obj) {
            this.physicsWorld.removeRigidBody(obj.body);
            this.objects.delete(uuid);
        }
    }

    dispose() {
        // Clean up physics objects
        this.objects.forEach((obj) => {
            this.physicsWorld.removeRigidBody(obj.body);
        });
        this.objects.clear();
    }
} 