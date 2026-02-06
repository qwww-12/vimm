// commands/logtime.js
import axios from 'axios';
import 'dotenv/config'

// Configuration for 42 API
const CLIENT_ID = 'process.env.INTRA_CLIENT_ID';
const CLIENT_SECRET = 'process.env.INTRA_CLIENT_SECRET'; 

let accessToken = null;
let tokenExpiry = null;

// Function to get access token
async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        });

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        return accessToken;
    } catch (error) {
        console.error('Error getting token:', error.message);
        throw error;
    }
}

// Function to calculate dates (from 28th of previous month to 27th of current month)
function getDateRange() {
    const now = new Date();
    const currentDay = now.getDate();
    
    let startDate, endDate;
    
    if (currentDay >= 28) {
        // If we're after the 28th, period starts on 28th of this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 28);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 27, 23, 59, 59);
    } else {
        // If we're before the 28th, period started on 28th of previous month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 28);
        endDate = new Date(now.getFullYear(), now.getMonth(), 27, 23, 59, 59);
    }
    
    return {
        start: startDate.toISOString(),
        end: endDate.toISOString()
    };
}

// Function to get user logtime
async function getUserLogtime(username) {
    try {
        const token = await getAccessToken();
        const { start, end } = getDateRange();
        
        // Get user information
        const userResponse = await axios.get(
            `https://api.intra.42.fr/v2/users/${username}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!userResponse.data) {
            return null;
        }

        // Get locations (logtime)
        const locationsResponse = await axios.get(
            `https://api.intra.42.fr/v2/users/${username}/locations`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    'range[begin_at]': start + ',' + end,
                    sort: '-begin_at',
                    per_page: 100
                }
            }
        );

        const locations = locationsResponse.data;
        
        // Calculate total time in hours
        let totalSeconds = 0;
        const now = new Date();

        for (const location of locations) {
            const beginAt = new Date(location.begin_at);
            const endAt = location.end_at ? new Date(location.end_at) : now;
            
            const duration = (endAt - beginAt) / 1000; // in seconds
            totalSeconds += duration;
        }

        const totalHours = (totalSeconds / 3600).toFixed(2);

        return {
            username: userResponse.data.login,
            displayName: userResponse.data.displayname,
            totalHours: totalHours,
            sessionCount: locations.length,
            periodStart: new Date(start).toLocaleDateString('en-US'),
            periodEnd: new Date(end).toLocaleDateString('en-US')
        };

    } catch (error) {
        console.error('Error getting logtime:', error.message);
        return null;
    }
}

export async function logtime(sock, msg) {
    const chatId = msg.key.remoteJid;
    
    try {
        // Extract username from message
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || "";
        
        const parts = text.trim().split(' ');
        
        if (parts.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ *Usage:* -logtime <username>\n\nExample: -logtime achakour'
            });
            return;
        }

        const username = parts[1];

        await sock.sendMessage(chatId, {
            text: '⏳ Getting logtime, please wait...'
        });

        const logtimeData = await getUserLogtime(username);

        if (!logtimeData) {
            await sock.sendMessage(chatId, {
                text: `❌ Could not get data for user *${username}*\n\nMake sure the username is correct.`
            });
            return;
        }

        const response = `
╔═══════════════════════╗
║    📊 *LOGTIME INFO*    ║
╚═══════════════════════╝

👤 *User:* ${logtimeData.displayName} (@${logtimeData.username})

📅 *Period:* 
   From ${logtimeData.periodStart} to ${logtimeData.periodEnd}

⏱️ *Total Time:* ${logtimeData.totalHours} hours

🔢 *Number of Sessions:* ${logtimeData.sessionCount}

━━━━━━━━━━━━━━━━━━━━━
`.trim();

        await sock.sendMessage(chatId, { text: response });

    } catch (error) {
        console.error('Error in logtime command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ An error occurred while getting logtime.'
        });
    }
}