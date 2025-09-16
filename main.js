// create_ad_accounts_token_get.js
// Node.js script: create ad accounts using access token only (GET method)
// Dependencies: axios
// Install: npm install axios

const axios = require("axios");

// ==================== CONFIG ====================
const BM_ID = "1863355194466089";    // Business Manager ID
const TOKEN = "EAALYK8qHET0BPbzys3jJPoDEUYFlr2V5wZCbzLhuir8ZBnTGdrvK1xU3XCO4l2ssgblGBYvBZAszAQVqZABeZC8PpZATs4CxCvAaWIuD3vM88bDPHjCanob5ZAZAY3OSAvzKCIsk7bkVVLjC22fzRHJrYMooAfRkjJUvZBCNwVHqU3KxQZC6OqNy17rDvZCKsW5"; // access token
const TOTAL = 2500;                    // số lượng tài khoản muốn tạo
const NAME_PREFIX = "Nolimit Vip Fix";     // tiền tố tên
const TIMEZONE_ID = "379";             // GMT+0
const DELAY_MIN = 1000;               // delay ngẫu nhiên tối thiểu (ms)
const DELAY_MAX = 1500;               // delay ngẫu nhiên tối đa (ms)
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
    for (let i = 1; i <= TOTAL; i++) {
        console.log(`${c.yellow}[main] Creating account #${i} ...${c.reset}`);
        const res = await createAdAccount(i);

        if (!res.success) {

            if (res.error.message === "An unexpected error has occurred. Please retry your request later." || (res.error.error_user_title && res.error.error_user_title.includes("Can only create one ad account at a time"))) {
                errorCount--;
		await sleep(20000);
                console.error(`${c.red}[main] ❌ Tạo tài khoản #${i} thất bại. (Lỗi tạm thời, không tính vào lỗi liên tiếp)${c.reset}`);
            } else {
                errorCount++;
		await sleep(10000);
                console.error(`${c.red}[main] ❌ Tạo tài khoản #${i} thất bại. (Lỗi liên tiếp: ${errorCount})${c.reset}`);
            }
            


            if (errorCount >= 10) {
                console.error(`${c.red}[main] ❌ Đã gặp lỗi liên tục 10 lần, dừng chương trình.${c.reset}`);
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
