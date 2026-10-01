import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // './' membuat seluruh asset relatif terhadap index.html, sehingga build
  // tetap jalan saat di-host di https://<user>.github.io/<repo>/.
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
