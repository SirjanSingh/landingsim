import * as THREE from '/node_modules/three/build/three.module.js';

export class UI {
    constructor(spacecraft) {
        this.spacecraft = spacecraft;
        this.setupEventListeners();
        this.alertTimeout = null;
    }

    setupEventListeners() {
        document.addEventListener('spacecraft-crashed', () => this.showCrashSummary());
        document.addEventListener('spacecraft-landed', () => this.showLandingSummary());
    }

    update() {
        // Update HUD elements
        this.updateAltitude();
        this.updateVelocity();
        this.updateFuel();
        this.updateOrientation();
        this.checkWarnings();
    }

    updateAltitude() {
        const altitude = Math.max(0, Math.floor(this.spacecraft.mesh.position.y));
        document.getElementById('altitude').textContent = altitude;
    }

    updateVelocity() {
        const velocity = this.spacecraft.physics.getLinearVelocity(this.spacecraft.mesh.uuid);
        const verticalSpeed = -velocity.y.toFixed(1);
        const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z).toFixed(1);

        document.getElementById('vertical-speed').textContent = verticalSpeed;
        document.getElementById('horizontal-speed').textContent = horizontalSpeed;

        // Add warning colors
        const verticalSpeedElement = document.getElementById('vertical-speed');
        if (Math.abs(verticalSpeed) > 8) {
            verticalSpeedElement.style.color = '#ff0000';
        } else if (Math.abs(verticalSpeed) > 5) {
            verticalSpeedElement.style.color = '#ffff00';
        } else {
            verticalSpeedElement.style.color = '#0ff';
        }
    }

    updateFuel() {
        const fuel = Math.floor(this.spacecraft.fuel);
        const fuelElement = document.getElementById('fuel');
        fuelElement.textContent = fuel;

        // Add warning colors
        if (fuel < 20) {
            fuelElement.style.color = '#ff0000';
            this.showAlert('Low Fuel Warning!');
        } else if (fuel < 40) {
            fuelElement.style.color = '#ffff00';
        } else {
            fuelElement.style.color = '#0ff';
        }
    }

    updateOrientation() {
        const rotation = new THREE.Euler().setFromQuaternion(this.spacecraft.mesh.quaternion);
        const pitch = (rotation.x * 180 / Math.PI).toFixed(1);
        const roll = (rotation.z * 180 / Math.PI).toFixed(1);

        document.getElementById('pitch').textContent = pitch;
        document.getElementById('roll').textContent = roll;

        // Add warning colors for extreme angles
        const pitchElement = document.getElementById('pitch');
        const rollElement = document.getElementById('roll');

        if (Math.abs(rotation.x) > Math.PI / 4) {
            pitchElement.style.color = '#ff0000';
            this.showAlert('Extreme Pitch Angle!');
        } else if (Math.abs(rotation.x) > Math.PI / 6) {
            pitchElement.style.color = '#ffff00';
        } else {
            pitchElement.style.color = '#0ff';
        }

        if (Math.abs(rotation.z) > Math.PI / 4) {
            rollElement.style.color = '#ff0000';
            this.showAlert('Extreme Roll Angle!');
        } else if (Math.abs(rotation.z) > Math.PI / 6) {
            rollElement.style.color = '#ffff00';
        } else {
            rollElement.style.color = '#0ff';
        }
    }

    checkWarnings() {
        const velocity = this.spacecraft.physics.getLinearVelocity(this.spacecraft.mesh.uuid);
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);

        if (speed > 15) {
            this.showAlert('Dangerous Speed!');
        }

        if (this.spacecraft.mesh.position.y < 20 && speed > 5) {
            this.showAlert('Pull Up! Terrain Ahead!');
        }
    }

    showAlert(message) {
        const alertsElement = document.getElementById('alerts');
        alertsElement.textContent = message;
        alertsElement.style.opacity = '1';

        // Clear previous timeout
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }

        // Hide alert after 2 seconds
        this.alertTimeout = setTimeout(() => {
            alertsElement.style.opacity = '0';
        }, 2000);
    }

    showCrashSummary() {
        const velocity = this.spacecraft.physics.getLinearVelocity(this.spacecraft.mesh.uuid);
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
        const rotation = new THREE.Euler().setFromQuaternion(this.spacecraft.mesh.quaternion);
        const angle = Math.max(Math.abs(rotation.x), Math.abs(rotation.z)) * 180 / Math.PI;

        document.getElementById('summary-speed').textContent = speed.toFixed(1);
        document.getElementById('summary-fuel').textContent = Math.floor(this.spacecraft.fuel);
        document.getElementById('summary-angle').textContent = angle.toFixed(1);
        document.getElementById('summary-rating').textContent = 'Crashed!';
        document.getElementById('landing-summary').style.display = 'block';
    }

    showLandingSummary() {
        const velocity = this.spacecraft.physics.getLinearVelocity(this.spacecraft.mesh.uuid);
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
        const rotation = new THREE.Euler().setFromQuaternion(this.spacecraft.mesh.quaternion);
        const angle = Math.max(Math.abs(rotation.x), Math.abs(rotation.z)) * 180 / Math.PI;

        document.getElementById('summary-speed').textContent = speed.toFixed(1);
        document.getElementById('summary-fuel').textContent = Math.floor(this.spacecraft.fuel);
        document.getElementById('summary-angle').textContent = angle.toFixed(1);

        // Calculate rating based on landing parameters
        let rating;
        if (speed < 1 && angle < 5 && this.spacecraft.fuel > 50) {
            rating = 'Perfect!';
        } else if (speed < 2 && angle < 10 && this.spacecraft.fuel > 30) {
            rating = 'Great!';
        } else if (speed < 3 && angle < 15) {
            rating = 'Good';
        } else {
            rating = 'Safe';
        }

        document.getElementById('summary-rating').textContent = rating;
        document.getElementById('landing-summary').style.display = 'block';
    }
} 