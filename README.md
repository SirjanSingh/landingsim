# 3D Planet Landing Simulator

A realistic 3D spacecraft landing simulator built with Three.js and Ammo.js physics engine. Practice landing a spacecraft on a procedurally generated lunar terrain while managing fuel, orientation, and velocity.

## Features

- Realistic physics simulation using Ammo.js
- Procedurally generated terrain
- Real-time flight data display (HUD)
- Particle effects for thrusters
- Landing/crash detection
- Performance rating system
- Realistic spacecraft controls

## Technologies Used

- Three.js (v0.162.0) - 3D graphics
- Ammo.js (v1.0.6) - Physics engine
- Simplex Noise (v4.0.1) - Terrain generation
- Vite (v5.1.4) - Build tool and development server

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Controls

- **W/S**: Pitch forward/backward
- **A/D**: Roll left/right
- **Q/E**: Yaw left/right
- **Space**: Main thruster
- **Shift**: Hover thruster
- **R**: Reset simulation

## Landing Tips

- Keep vertical speed under 5 m/s for safe landing
- Maintain level orientation (pitch and roll under 10°)
- Watch fuel consumption
- Aim for smooth touchdown with minimal horizontal speed

## License

MIT License 