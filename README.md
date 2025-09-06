# 🔑 Key Auto Collector Extension

[![GitHub](https://img.shields.io/badge/GitHub-kabistarvn-blue)](https://github.com/kabistarvn)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)](https://chrome.google.com/webstore)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)](https://t.me/tokencussor_bot)

Extension Chrome tự động lấy token từ trang web tokencursor.io.vn và gửi qua Telegram bot mỗi 20 phút.

## 🎯 Tính năng chính

- ✅ **Tự động đăng nhập**: Kiểm tra trạng thái đăng nhập và tự động đăng nhập nếu cần
- ✅ **Click nút "Lấy Token"**: Tự động tìm và click nút lấy token
- ✅ **Trích xuất token**: Tìm và trích xuất token từ trang web
- ✅ **Gửi qua Telegram**: Tự động gửi token qua Telegram bot mỗi 20 phút
- ✅ **Chạy định kỳ**: Tự động chạy mỗi 20 phút
- ✅ **Giao diện popup**: Test và quản lý extension dễ dàng
- ✅ **Telegram Only Mode**: Không tải file về máy, chỉ gửi qua Telegram

## 📁 Cấu trúc dự án

```
key-auto-extension/
├── manifest.json          # Cấu hình extension
├── background.js          # Script chạy ngầm
├── content.js            # Script chạy trên trang web
├── popup.html            # Giao diện popup
├── popup.js              # Logic popup
└── README.md             # Hướng dẫn extension

test-telegram-only.html   # File test extension
TELEGRAM_ONLY_UPDATE.md   # Changelog và cập nhật
```

## 🚀 Cài đặt

### Bước 1: Tải extension
```bash
git clone https://github.com/kabistarvn/key-auto-collector-extension.git
cd key-auto-collector-extension
```

### Bước 2: Cài đặt trong Chrome
1. Mở Chrome và vào `chrome://extensions/`
2. Bật "Developer mode" (góc trên bên phải)
3. Click "Load unpacked" và chọn thư mục `key-auto-extension`
4. Extension sẽ xuất hiện trong thanh công cụ

### Bước 3: Cấu hình
1. Mở trang `https://tokencursor.io.vn/app`
2. Click vào icon extension để test
3. Extension sẽ tự động hoạt động mỗi 20 phút

## 📱 Telegram Bot

Extension tích hợp với Telegram bot để gửi token tự động:

- **Bot**: [@tokencussor_bot](https://t.me/tokencussor_bot)
- **Bot Token**: `8349265007:AAEGSWe7kfe7Vw2th02Hs4o4HePMdgtzaJM`
- **Chat ID**: `709847427`
- **Tần suất**: Mỗi 20 phút tự động gửi token mới

### Format tin nhắn Telegram:
```
🔑 CURSOR TOKEN MỚI
⏰ Thời gian: [timestamp]
🌐 URL: https://tokencursor.io.vn/app
🔐 Key: kabistarvnzxczxc

[TOKEN_CONTENT]

🤖 Tự động gửi bởi Key Auto Collector
```

## 🧪 Test

Sử dụng file `test-telegram-only.html` để test extension:
- Test kết nối Telegram
- Test auto collection
- Test full process
- Xem log status real-time

## 📋 Quy trình tự động

1. **Kiểm tra đăng nhập** → Tìm dấu hiệu đã đăng nhập
2. **Đăng nhập nếu cần** → Tự động điền key và click đăng nhập
3. **Kiểm tra cooldown** → Xem token có sẵn sàng không
4. **Click nút "Lấy Token"** → Tìm và click nút lấy token
5. **Trích xuất token** → Tìm token trong nội dung trang
6. **Gửi Telegram** → Gửi token qua Telegram bot

## 🔧 Sử dụng

### Tự động
Extension sẽ tự động chạy mỗi 20 phút khi:
- Có tab mở trang `tokencursor.io.vn`
- Extension được bật
- Trang web có thể truy cập

### Thủ công
Click vào icon extension và sử dụng các nút:
- **🚀 Tự Động Lấy Token Ngay**: Chạy toàn bộ quy trình tự động
- **📱 Test Telegram**: Test gửi token qua Telegram bot
- **👆 Click Nút "Lấy Token"**: Chỉ click nút lấy token
- **🔍 Tìm Token Trên Trang**: Tìm token có sẵn trên trang
- **📤 Gửi Token Thủ Công**: Nhập và gửi token thủ công

## ⚠️ Lưu ý quan trọng

- Extension cần quyền truy cập trang `tokencursor.io.vn`
- Token được gửi qua Telegram, **KHÔNG tải file về máy**
- Extension chạy tự động mỗi 20 phút khi có tab mở trang đích
- Có thể test thủ công qua popup bất kỳ lúc nào
- Cần kết nối internet để gửi Telegram

## 🔧 Xử lý sự cố

### Extension không hoạt động
1. Kiểm tra console log (F12) để debug
2. Đảm bảo extension có quyền truy cập trang web
3. Reload extension trong `chrome://extensions/`
4. Kiểm tra trang `tokencursor.io.vn/app` hoạt động bình thường

### Không nhận được token qua Telegram
1. Kiểm tra kết nối internet
2. Test Telegram bằng nút "📱 Test Telegram"
3. Kiểm tra bot [@tokencussor_bot](https://t.me/tokencussor_bot)
4. Đảm bảo đã đăng nhập vào trang web

### Token button bị cooldown
1. Extension sẽ tự động gửi thông báo cooldown qua Telegram
2. Extension sẽ tự động thử lại sau khi hết cooldown
3. Có thể test thủ công qua popup

## 📊 Changelog

Xem file [TELEGRAM_ONLY_UPDATE.md](TELEGRAM_ONLY_UPDATE.md) để biết chi tiết các cập nhật mới nhất.

### Phiên bản hiện tại: Telegram Only Mode
- ✅ Chỉ gửi token qua Telegram
- ✅ Không tải file về máy
- ✅ Thông báo cooldown qua Telegram
- ✅ Tự động retry sau cooldown

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Tác giả

**kabistarvn**
- GitHub: [@kabistarvn](https://github.com/kabistarvn)
- Telegram: [@tokencussor_bot](https://t.me/tokencussor_bot)

## 🙏 Acknowledgments

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [tokencursor.io.vn](https://tokencursor.io.vn)

---

⭐ Nếu dự án hữu ích, hãy cho một star nhé!
