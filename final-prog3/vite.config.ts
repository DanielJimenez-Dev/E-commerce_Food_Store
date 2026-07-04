import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
    }
});