// test-logtime-med.js
import axios from 'axios';

async function testLogtimeMed(username) {
    console.log(`\n🔍 Testing logtime-med.1337.ma for: ${username}\n`);
    
    // Test 1: Try main page
    try {
        console.log('📄 Test 1: Main page HTML...');
        const response = await axios.get(`https://logtime-med.1337.ma/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log('Status:', response.status);
        console.log('Content type:', response.headers['content-type']);
        console.log('Content length:', response.data.length);
        console.log('First 1000 chars:\n', response.data.substring(0, 1000));
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
    
    // Test 2: Try API endpoints
    const endpoints = [
        '',
        '/api',
        '/api/logtime',
        '/api/user',
        '/logtime',
        '/user'
    ];
    
    console.log('\n\n🔌 Test 2: Trying API endpoints...\n');
    
    for (const endpoint of endpoints) {
        const url = `https://logtime-med.1337.ma${endpoint}/${username}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 5000
            });
            
            console.log(`✅ ${url}`);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            console.log('---\n');
        } catch (err) {
            if (err.response) {
                console.log(`❌ ${url} - Status: ${err.response.status}`);
            } else {
                console.log(`❌ ${url} - ${err.message}`);
            }
        }
    }
}

// Test with a known username
testLogtimeMed('mbarhoun');