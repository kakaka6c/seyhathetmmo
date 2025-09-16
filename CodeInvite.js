(async () => {
    // === LẤY BM_ID TỪ URL ===
    const url = window.location.href;
    const bmMatch = url.match(/business_id=(\d+)/) || url.match(/facebook\.com\/business\/(\d+)/);
    const BM_ID = bmMatch ? bmMatch[1] : "";
    if (!BM_ID) {
        alert("❌ Không tìm thấy BM_ID trên URL");
        return;
    }

    // === LẤY uid, fb_dtsg, lsd ===
    const uid = require("CurrentUserInitialData").ACCOUNT_ID;
    const fb_dtsg = (() => {
        try { return require("DTSGInitialData").token; } catch { }
        return document.querySelector('input[name="fb_dtsg"]')?.value || "";
    })();
    const lsd = (() => {
        try { return require("LSD").token; } catch { }
        return document.querySelector('input[name="lsd"]')?.value || "";
    })();

    // === DANH SÁCH TASK_ID ===
    const TASK_IDS = [
        "926381894526285",
        "603931664885191",
        "1327662214465567",
        "862159105082613",
        "6161001899617846786",
        "1633404653754086",
        "967306614466178",
        "2848818871965443",
        "245181923290198",
        "388517145453246"
    ];
    const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok";

    // === DANH SÁCH EMAIL HAY DÙNG ===
    const favoriteEmails = [
    ];

    // === TẠO POPUP FORM ===
    const box = document.createElement("div");
    box.innerHTML = `
    <div id="inviteBox" style="
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      width:380px;padding:20px;z-index:999999;
      background:#fff;border:1px solid #ddd;
      border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);
      font-family:sans-serif;">
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;font-size:18px;color:#1c1e21;">🚀 Invite Admin</h3>
        <button id="closeBtn" style="
          background:transparent;border:none;font-size:18px;cursor:pointer;
          color:#606770;font-weight:bold;">✖</button>
      </div>

      <p style="margin:0 0 10px;font-size:13px;color:#606770;text-align:center;">
        BM_ID: <b style="color:#1877f2">${BM_ID}</b>
      </p>
	  
	  <div style="
		position:sticky;top:0;z-index:1;
		background:#fff;padding:6px;
		border-bottom:1px solid #eee;font-weight:bold;">
		📌 Mail hay dùng:
	  </div>

      <div id="favEmailsBox" style="margin-bottom:10px;padding:8px;border:1px solid #eee;border-radius:8px;max-height:100px;overflow:auto;font-size:13px;">
        ${favoriteEmails.map(e => `
          <label style="display:block;margin-top:4px;">
            <input type="checkbox" value="${e}" class="favEmailChk"> ${e}
          </label>`).join("")}
      </div>
      
      <textarea id="emailInput" placeholder="Nhập mỗi dòng 1 email..." rows="5"
        style="width:100%;padding:10px;font-size:14px;
        border:1px solid #ccc;border-radius:8px;
        outline:none;margin-bottom:12px;box-sizing:border-box;resize:vertical;"></textarea>
      
      <div style="margin-bottom:10px;">
        <label>
          <input type="checkbox" id="useAliasEmail" style="margin-right:6px;">
          Sử dụng alias email (thêm "+..." vào trước @)
        </label>
      </div>

      <button id="inviteBtn" style="
        width:100%;padding:10px;font-size:15px;
        background:#1877f2;color:#fff;font-weight:bold;
        border:none;border-radius:8px;cursor:pointer;">
        ➕ Mời Admin
      </button>

      <div id="logBox" style="
        margin-top:15px;padding:10px;height:160px;
        background:#f9f9f9;border:1px solid #eee;border-radius:8px;
        font-size:13px;color:#333;overflow:auto;white-space:pre-line;">
        <b>Log:</b>
      </div>
    </div>
  `;
    document.body.appendChild(box);

    // === LOG FUNCTION ===
    const logBox = document.getElementById("logBox");
    const addLog = (msg, type = "info") => {
        const p = document.createElement("div");
        p.style.marginTop = "4px";
        if (type === "success") p.style.color = "green";
        else if (type === "error") p.style.color = "red";
        else p.style.color = "#555";
        p.textContent = msg;
        logBox.appendChild(p);
        logBox.scrollTop = logBox.scrollHeight;
    };

    // === INVITE FUNCTION ===
    async function inviteEmail(email) {
        const params = new URLSearchParams();
        params.append("av", uid);
        params.append("__user", uid);
        params.append("__a", "1");
        if (lsd) params.append("lsd", lsd);
        params.append("fb_dtsg", fb_dtsg);
        params.append("fb_api_caller_class", "RelayModern");
        params.append("fb_api_req_friendly_name", "BizKitSettingsInvitePeopleModalMutation");
        params.append("server_timestamps", "true");
        params.append("doc_id", "31295717360015609");

        params.append("variables", JSON.stringify({
            input: {
                client_mutation_id: "3",
                actor_id: uid,
                business_id: BM_ID,
                business_emails: [email],
                business_account_task_ids: TASK_IDS,
                invite_origin_surface: "MBS_INVITE_USER_FLOW",
                assets: [],
                use_detailed_coded_exception: true,
                expiry_time: 0,
                is_spark_permission: false,
                client_timezone_id: clientTz
            }
        }));

        try {
            const res = await fetch("https://www.facebook.com/api/graphql/", {
                method: "POST",
                body: params,
                credentials: "include"
            });
            const text = await res.text();

            // === CHECK KẾT QUẢ ===
            if (text.includes('"business_role_requests"')) {
                addLog("✅ Thành công: " + email, "success");
            }
            else if (text.includes("<title>Error</title>") || text.includes("Sorry, something went wrong")) {
                addLog("✅ Thành công: " + email, "success");
            }
            else {
                addLog("❌ Thất bại: " + email, "error");
            }

            console.log("📩 Kết quả mời:", email, text);
        } catch (e) {
            console.error("❌ Lỗi gửi invite:", e);
            addLog("❌ Lỗi khi gửi invite: " + email + " → " + e.message, "error");
        }
    }

    // === BUTTON CLICK (Promise.all để mời đồng thời) ===
    document.getElementById("inviteBtn").onclick = async () => {
        const useAlias = document.getElementById("useAliasEmail").checked;
        let emails = document.getElementById("emailInput").value
            .split("\n")
            .map(e => e.trim())
            .filter(e => e);

        if (useAlias) {
            emails = emails.map((email, idx) => {
                const atIdx = email.indexOf("@");
                if (atIdx > 0) {
                    // Thêm +số thứ tự và random 6 số vào trước @
                    const random6 = Math.floor(100000 + Math.random() * 900000);
                    return email.slice(0, atIdx) + `+${idx + 1}${random6}` + email.slice(atIdx);
                }
                return email;
            });
        }

        if (emails.length === 0) return addLog("❌ Vui lòng nhập ít nhất 1 email", "error");

        addLog(`🚀 Gửi đồng thời ${emails.length} lời mời...`, "info");

        const tasks = emails.map(email => {
            addLog("⏳ Đang gửi: " + email, "info");
            return inviteEmail(email);
        });

        try {
            await Promise.all(tasks);
            addLog("✅ Hoàn tất gửi đồng thời!", "success");
        } catch (err) {
            addLog("❌ Có lỗi khi gửi hàng loạt: " + err.message, "error");
        }
    };

    // === CLOSE BUTTON ===
    document.getElementById("closeBtn").onclick = () => {
        document.getElementById("inviteBox").remove();
    };

    // === XỬ LÝ CHỌN MAIL CÓ SẴN ===
    document.querySelectorAll(".favEmailChk").forEach(chk => {
        chk.addEventListener("change", () => {
            const textarea = document.getElementById("emailInput");
            let current = textarea.value.split("\n").map(e => e.trim()).filter(e => e);

            if (chk.checked) {
                if (!current.includes(chk.value)) {
                    current.push(chk.value);
                }
            } else {
                current = current.filter(e => e !== chk.value);
            }

            textarea.value = current.join("\n");
        });
    });
})();
