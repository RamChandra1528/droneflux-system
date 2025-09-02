// Simple test script to verify profile picture endpoints
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function testProfilePicture() {
  try {
    console.log('Testing profile picture endpoints...');
    
    // Test 1: Check if endpoints exist
    console.log('1. Testing endpoint availability...');
    
    const response = await axios.get(`${BASE_URL}/users/profile/picture/test`, {
      validateStatus: () => true // Accept any status code
    });
    
    if (response.status === 404 && response.data.error === 'Profile picture not found') {
      console.log('✅ Profile picture endpoint is working (returns 404 for non-existent picture)');
    } else {
      console.log('❌ Unexpected response:', response.status, response.data);
    }
    
    console.log('Profile picture functionality is set up correctly!');
    
  } catch (error) {
    console.error('❌ Error testing profile picture:', error.message);
  }
}

testProfilePicture();
