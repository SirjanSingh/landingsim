import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        open: true
    },
    optimizeDeps: {
        include: ['ammojs-typed', 'three']
    },
    build: {
        commonjsOptions: {
            include: [/ammojs-typed/, /three/]
        },
        rollupOptions: {
            external: ['three'],
            output: {
                globals: {
                    three: 'THREE'
                }
            }
        }
    },
    resolve: {
        alias: {
            'three': 'three/build/three.module.js'
        }
    }
}); 