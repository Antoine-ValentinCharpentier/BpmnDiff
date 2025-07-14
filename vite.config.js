import { resolve } from 'path'

export default {
  root: 'app/views',
  base: '/',
  build: {
    manifest: true,
    outDir: '../../public',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'app/views/main.js'),
    },
  },
  server: {
    middlewareMode: true,
  }
}
