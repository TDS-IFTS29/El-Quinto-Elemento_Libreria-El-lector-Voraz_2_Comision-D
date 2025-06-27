module.exports = {
  // Run tests sequentially instead of in parallel
  maxWorkers: 1,
  
  // Environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Set NODE_ENV to test
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // Test timeout (increased for slower sequential runs)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Coverage (optional)
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ]
};
