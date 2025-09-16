// create_ad_accounts_token_get.js
// Node.js script: create ad accounts using access token only (GET method)
// Dependencies: axios
// Install: npm install axios

const axios = require("axios");

// ==================== CONFIG ====================
const BM_ID = "1224550838484855";    // Business Manager ID
let TOKEN = "EAATAYJW8apoBPUIDkD7BBhCemyDmBNFF9MdFsFR7EFT8WoCWzHY6UO55QZAZCaGdYFew7ZCCdAXzNXoHLcPBEi3cRggl4xajxB3RlaxB6wjLWoM4Gkt7Q6POZBZAhwNppxaAFoamTdAEHerkMN27x471m7ittHcGeiLPoREVZB374mI34MvnazSzdiAqIlMYQf"; // access token
const TOTAL = 2500;                    // số lượng tài khoản muốn tạo
const NAME_PREFIX = "Nolimit Vip Seyhathet";     // tiền tố tên
const TIMEZONE_ID = "1";             // GMT+0
const DELAY_MIN = 1000;               // delay ngẫu nhiên tối thiểu (ms)
const DELAY_MAX = 1200;               // delay ngẫu nhiên tối đa (ms)
// =================================================

// ANSI colors
const c = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bold: "\x1b[1m"
};

// helper delay
// Hàm lấy token mới
async function refreshToken(oldToken) {
    const url = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1337420968389274&client_secret=a8d7fa65dfbdc3a972f1422738422216&fb_exchange_token=${oldToken}`;
    try {
        const res = await axios.get(url, { timeout: 20000 });
        if (res.data && res.data.access_token) {
            console.log(`${c.cyan}[main] Đã đổi token mới!${c.reset}`);
            return res.data.access_token;
        } else {
            console.error(`${c.red}[main] Không lấy được token mới!${c.reset}`);
            return oldToken;
        }
    } catch (err) {
        console.error(`${c.red}[main] Lỗi khi lấy token mới!${c.reset}`);
        return oldToken;
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function randomDelay() {
    return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
}

// tạo 1 ad account (GET mode)
async function createAdAccount(i) {
    const name = `${NAME_PREFIX}-${i}`;

    const params = new URLSearchParams({
        access_token: TOKEN,
        currency: "USD",
        end_advertiser: BM_ID,
        media_agency: "UNFOUND",
        method: "post", // API yêu cầu
        name: name,
        partner: "UNFOUND",
        pretty: "0",
        suppress_http_code: "1",
        timezone_id: TIMEZONE_ID
    });

    const url = `https://graph.facebook.com/v17.0/${BM_ID}/adaccount?${params.toString()}`;
    // console.log(url);
    try {
        const res = await axios.get(url, { timeout: 50000 });
        if (res.data && res.data.error) {
            return { success: false, error: res.data.error };
        }
        return { success: true, body: res.data };
    } catch (err) {
        if (err.response && err.response.data) {
            return { success: false, error: err.response.data };
        }
        return { success: false, error: { message: err.message || String(err) } };
    }
}

// main runner
(async () => {
    console.log(`${c.cyan}${c.bold}=== Start creating ad accounts (GET mode) ===${c.reset}`);

    if (!TOKEN || TOKEN.trim() === "") {
        console.error(`${c.red}❌ Access token is empty. Please set TOKEN in config.${c.reset}`);
        process.exit(1);
    }

    let errorCount = 0;
    let requestCount = 0;
    for (let i = 1; i <= TOTAL; i++) {
        console.log(`${c.yellow}[main] Creating account #${i} ...${c.reset}`);
        const res = await createAdAccount(i);
        requestCount++;

        if (requestCount % 30 === 0) {
            // Đổi token sau mỗi 30 lần request
            TOKEN = await refreshToken(TOKEN);
            await sleep(5000);
        }

        if (!res.success) {
            errorCount++;
            console.error(`${c.red}[main] ❌ Tạo tài khoản #${i} thất bại. ${res.error || "Unknown error"} (Lỗi liên tiếp: ${errorCount})${c.reset}`);
            await sleep(10000);
            if (errorCount >= 5) {
                console.error(`${c.red}[main] ❌ Đã gặp lỗi liên tục 5 lần, dừng chương trình.${c.reset}`);
                break;
            }
        } else {
            errorCount = 0;
            console.log(`${c.green}[main] ✅ Created #${i} success.${c.reset}`);
            if (i < TOTAL) {
                const ms = randomDelay();
                console.log(`${c.blue}[main] ⏳ Waiting ${ms} ms before next...${c.reset}`);
                await sleep(ms);
            }
        }
    }

    console.log(`${c.magenta}${c.bold}=== Finished run ===${c.reset}`);
})();
