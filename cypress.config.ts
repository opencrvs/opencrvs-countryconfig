import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  projectId: 'j9bgv5',
  viewportWidth: 1024,
  viewportHeight: 768,
  defaultCommandTimeout: 60000,
  videoCompression: 0,
  retries: {
    runMode: 1,
    openMode: 2
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
})
