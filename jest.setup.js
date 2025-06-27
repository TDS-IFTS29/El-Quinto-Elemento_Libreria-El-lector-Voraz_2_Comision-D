const mongoose = require('mongoose');

// Global setup
beforeAll(async () => {
  // Ensure we're using the test database
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.includes('test')) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/el_lector_voraz_test';
  }
});

// Global teardown
afterAll(async () => {
  // Close any open database connections
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Force close all mongoose connections
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('Error closing mongoose connection:', error);
  }
  
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
});
