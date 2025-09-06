// popup.js

document.addEventListener('DOMContentLoaded', function() {
  const getKeyBtn = document.getElementById('getKeyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyTokenBtn = document.getElementById('copyTokenBtn');
  const extractTokenBtn = document.getElementById('extractTokenBtn');
  const clickGetTokenBtn = document.getElementById('clickGetTokenBtn');
  const autoGetTokenBtn = document.getElementById('autoGetTokenBtn');
  const statusDiv = document.getElementById('status');
  
  // Khi nhấn nút "Lấy Key Ngay"
  getKeyBtn.addEventListener('click', function() {
    // Gửi message đến content script để lấy key
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getKey"}, function(response) {
        if (response && response.key) {
          // Gửi key đến background script để lưu
          chrome.runtime.sendMessage({action: "saveKey", key: response.key}, function(result) {
            if (result.status === "success") {
              showStatus("Đã lưu key thành công!", "success");
            } else {
              showStatus("Lỗi khi lưu key!", "error");
            }
          });
        } else {
          showStatus("Không tìm thấy key trên trang này!", "error");
        }
      });
    });
  });
  
  // Khi nhấn nút "Tải File Key"
  downloadBtn.addEventListener('click', function() {
    // Tạo file mẫu để tải về
    const content = "Key Auto Collector - File key sẽ được ghi đè mỗi 20 phút\n";
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: 'keys.txt',
      conflictAction: 'overwrite'
    });
    
    showStatus("Đang tạo file key...", "success");
  });
  
  // Khi nhấn nút "Sao chép Token"
  copyTokenBtn.addEventListener('click', function() {
    // Gửi message đến content script để sao chép token
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "copyToken"}, function(response) {
        if (response && response.success) {
          showStatus("Đã sao chép token thành công!", "success");
        } else {
          showStatus("Không thể sao chép token!", "error");
        }
      });
    });
  });
  
  // Khi nhấn nút "Trích xuất Token từ tokencursor"
  extractTokenBtn.addEventListener('click', function() {
    // Gửi message đến content script để trích xuất token từ tokencursor
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "extractTokenFromTokencursor"}, function(response) {
        if (response && response.token) {
          // Lưu token vào file
          chrome.runtime.sendMessage({action: "saveKey", key: response.token}, function(result) {
            if (result.status === "success") {
              showStatus("Đã lưu token thành công!", "success");
            } else {
              showStatus("Lỗi khi lưu token!", "error");
            }
          });
        } else {
          showStatus("Không thể trích xuất token từ trang này!", "error");
        }
      });
    });
  });
  
  // Khi nhấn nút "Click nút Lấy Token"
  clickGetTokenBtn.addEventListener('click', function() {
    // Gửi message đến content script để click nút "Lấy Token"
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "clickGetToken"}, function(response) {
        if (response && response.success) {
          showStatus("Đã click nút 'Lấy Token' thành công!", "success");
          
          // Sau khi click, thử lấy token (có thể cần đợi một chút)
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "getTokenAfterClick"}, function(response) {
              if (response && response.token) {
                // Lưu token vào file
                chrome.runtime.sendMessage({action: "saveToken", key: response.token}, function(result) {
                  if (result.status === "success") {
                    showStatus("Đã lưu token thành công!", "success");
                  } else {
                    showStatus("Lỗi khi lưu token!", "error");
                  }
                });
              } else {
                showStatus("Không tìm thấy token!", "error");
              }
            });
          }, 3000); // Đợi 3 giây để trang cập nhật
        } else {
          showStatus("Không thể click nút 'Lấy Token'!", "error");
        }
      });
    });
  });
  
  // Khi nhấn nút "Tự động lấy Token"
  autoGetTokenBtn.addEventListener('click', function() {
    showStatus("Đang tự động lấy token...", "success");
    
    // Gửi message đến content script để click nút "Lấy Token"
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "clickGetToken"}, function(response) {
        if (response && response.success) {
          // Sau khi click, thử lấy token (có thể cần đợi một chút)
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "getTokenAfterClick"}, function(response) {
              if (response && response.token) {
                // Lưu token vào file tự động
                chrome.runtime.sendMessage({action: "saveToken", token: response.token}, function(result) {
                  if (result.status === "success") {
                    showStatus("Đã tự động lưu token thành công!", "success");
                  } else {
                    showStatus("Lỗi khi lưu token!", "error");
                  }
                });
              } else {
                showStatus("Không tìm thấy token!", "error");
              }
            });
          }, 3000); // Đợi 3 giây để trang cập nhật
        } else {
          showStatus("Không thể click nút 'Lấy Token'!", "error");
        }
      });
    });
  });
  
  // Hàm hiển thị trạng thái
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
});