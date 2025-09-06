# 🔑 Key Auto Collector Extension

Extension tự động lấy token từ trang web tokencursor.io.vn và gửi qua Telegram.

## 🎯 Tính năng chính

- ✅ **Tự động đăng nhập**: Kiểm tra trạng thái đăng nhập và tự động đăng nhập nếu cần
- ✅ **Click nút "Lấy Token"**: Tự động tìm và click nút lấy token
- ✅ **Trích xuất token**: Tìm và trích xuất token từ trang web
- ✅ **Gửi qua Telegram**: Tự động gửi token qua Telegram bot mỗi 20 phút
- ✅ **Chạy định kỳ**: Tự động chạy mỗi 20 phút
- ✅ **Giao diện popup**: Test và quản lý extension dễ dàng

## 📁 Cấu trúc file

- `manifest.json` - Cấu hình extension và quyền
- `background.js` - Script chạy ngầm, tạo alarm mỗi 20 phút
- `content.js` - Script chạy trên trang web, xử lý đăng nhập và lấy token
- `popup.html` - Giao diện popup với các nút điều khiển
- `popup.js` - Logic xử lý các nút trong popup

## 🚀 Cài đặt

1. Mở Chrome và vào `chrome://extensions/`
2. Bật "Developer mode"
3. Click "Load unpacked" và chọn thư mục `key-auto-extension`
4. Extension sẽ xuất hiện trong thanh công cụ

## 📱 Telegram Bot

- **Bot Token**: `8349265007:AAEGSWe7kfe7Vw2th02Hs4o4HePMdgtzaJM`
- **Chat ID**: `709847427`
- **Tần suất**: Mỗi 20 phút tự động gửi token mới

## 🧪 Test

Sử dụng file `test-telegram-only.html` để test extension:
- Test kết nối Telegram
- Test auto collection
- Test full process

## 📋 Quy trình tự động

1. **Kiểm tra đăng nhập** → Tìm dấu hiệu đã đăng nhập
2. **Đăng nhập nếu cần** → Tự động điền key và click đăng nhập
3. **Click nút "Lấy Token"** → Tìm và click nút lấy token
4. **Trích xuất token** → Tìm token trong nội dung trang
5. **Gửi Telegram** → Gửi token qua Telegram bot

## ⚠️ Lưu ý

- Extension cần quyền truy cập trang `tokencursor.io.vn`
- Token được gửi qua Telegram, không tải file về máy
- Extension chạy tự động mỗi 20 phút khi có tab mở trang đích
- Có thể test thủ công qua popup bất kỳ lúc nào

## 🔧 Xử lý sự cố

- Kiểm tra console log (F12) để debug
- Đảm bảo đã đăng nhập vào trang web
- Kiểm tra kết nối internet cho Telegram
- Reload extension nếu cần thiết
