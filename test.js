
// Copyright Maxvia88.com
const axios = require('axios');

// === CONFIG ===
const delay = 0.5;                  // Thời gian giữa mỗi lần tạo (giây)
const length = 5500;               // Số lượng tài khoản muốn tạo
const access_token = "EAALYK8qHET0BPbzys3jJPoDEUYFlr2V5wZCbzLhuir8ZBnTGdrvK1xU3XCO4l2ssgblGBYvBZAszAQVqZABeZC8PpZATs4CxCvAaWIuD3vM88bDPHjCanob5ZAZAY3OSAvzKCIsk7bkVVLjC22fzRHJrYMooAfRkjJUvZBCNwVHqU3KxQZC6OqNy17rDvZCKsW5";
const businessId = "1235475470607525";

const currencies = ['USD', 'VND', 'EUR', 'AUD', 'SGD', 'JPY'];
const timezones = ['1', '29', '88', '190', '242', '370', '348', '103', '155'];

async function createAdAccountSequentially(index) {
    if (index > length) {
        console.log(`✅ DONE: Đã tạo xong ${length} tài khoản quảng cáo.`);
        return;
    }

    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const timezone_id = timezones[Math.floor(Math.random() * timezones.length)];
    const nameads = `${currency}_AD_${index}`;

    const url = `https://graph.facebook.com/v17.0/${businessId}/adaccount`;
    const bodyObj = {
        access_token,
        currency,
        end_advertiser: businessId,
        invoicing_emails: [],
        media_agency: "UNFOUND",
        method: "post",
        name: `${nameads} ${index}`,
        partner: "UNFOUND",
        po_number: "",
        pretty: "0",
        suppress_http_code: "1",
        timezone_id,
        xref: "",
        ad_account_created_from_bm_flag: true,
        __activeScenarioIDs: [],
        __activeScenarios: [],
        __interactionsMetadata: [],
        _reqName: "object:brand/adaccount",
        _reqSrc: "AdAccountActions.brands"
    };

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(bodyObj)) {
        if (Array.isArray(value)) {
            params.append(key, JSON.stringify(value));
        } else {
            params.append(key, value);
        }
    }

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const data = response.data;
        const now = new Date();
        const timeString = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}|${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}]`;

        if (data.account_id) {
            console.log(`✅ [${index}/${length}] Tạo thành công: ${data.id} | Currency: ${currency} | Timezone: ${timezone_id} ${timeString}`);
        } else {
            const errMsg = (data.error && (data.error.error_user_msg || data.error.message)) || "Lỗi không xác định";
            console.log(`⚠️ [${index}/${length}] Bỏ qua lỗi: ${errMsg} ${timeString}`);
        }

    } catch (err) {
        console.log(`⚠️ [${index}/${length}] Bỏ qua lỗi kết nối: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, delay * 1000));
    createAdAccountSequentially(index + 1);
}

// Bắt đầu tạo tài khoản
createAdAccountSequentially(1);