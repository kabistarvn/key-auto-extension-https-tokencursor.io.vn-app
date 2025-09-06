# 🔑 Key Auto Collector Extension

Chrome Extension tự động lấy token từ tokencursor.io.vn và gửi qua Telegram.

## 🎯 Tính năng

- ✅ Tự động đăng nhập và lấy token
- ✅ Gửi qua Telegram bot mỗi 20 phút  
- ✅ Giao diện popup để quản lý
- ✅ Telegram Only Mode

## 🚀 Cài đặt

1. Tải extension từ GitHub
2. Mở Chrome → `chrome://extensions/`
3. Bật "Developer mode"
4. Click "Load unpacked" → chọn thư mục `key-auto-extension`

## 📱 Telegram Bot

- **Bot**: [@tokencussor_bot](https://t.me/tokencussor_bot)
- **Tần suất**: Mỗi 20 phút tự động gửi token

## 🔧 Deploy

Chạy file `deploy.bat` để deploy lên GitHub:

```cmd
deploy.bat
```

## 📁 Cấu trúc

```
key-auto-extension/
├── manifest.json      # Cấu hình extension
├── background.js      # Service Worker
├── content.js        # Content Script
├── popup.html        # Popup Interface
├── popup.js          # Popup Logic
└── README.md         # Documentation
```

## 🔗 Repository

https://github.com/kabistarvn/key-auto-extension-https-tokencursor.io.vn-app

---
**Tác giả**: kabistarvn