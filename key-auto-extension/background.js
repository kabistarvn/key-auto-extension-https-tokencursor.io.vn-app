// background.js - Enhanced version with auto-login and token collection

// Create alarm to execute every 20 minutes
chrome.alarms.create("getToken", {
  delayInMinutes: 1,
  periodInMinutes: 20
});

// Listen to alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "getToken") {
    console.log("🔔 Alarm triggered - starting auto token collection");
    performAutoTokenCollection();
  }
});

// Function to perform automatic token collection
async function performAutoTokenCollection() {
  try {
    // First, ensure we have a tab open to the target website
    let targetTab = await ensureTargetTabOpen();
    
    if (!targetTab) {
      console.log("❌ Could not open target tab");
      return;
    }
    
    console.log("✅ Target tab ready:", targetTab.url);
    
    // Ensure tab is active
    await chrome.tabs.update(targetTab.id, { active: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ['content.js']
      });
      console.log("✅ Content script injected");
    } catch (e) {
      console.log("ℹ️ Content script already exists or error:", e.message);
    }
    
    // Use the new full automated process
    console.log("🔄 Starting full automated token collection process...");
    const fullProcessResult = await sendMessageToTab(targetTab.id, { 
      action: "fullAutoProcess", 
      key: "kabistarvnzxczxc" 
    });
    
    if (fullProcessResult && fullProcessResult.success) {
      console.log("✅ Full automated process completed successfully!");
      console.log("📝 Process message:", fullProcessResult.message);
      if (fullProcessResult.token) {
        console.log("🎯 Token obtained:", fullProcessResult.token.substring(0, 20) + "...");
        // Send token to Telegram
        await saveTokenToFile(fullProcessResult.token);
      }
    } else {
      console.log("❌ Full automated process failed");
      if (fullProcessResult) {
        console.log("📝 Error message:", fullProcessResult.message);
        
        // Handle cooldown case
        if (fullProcessResult.cooldown) {
          console.log("⏰ Token button is on cooldown");
          console.log("📅 Cooldown info:", fullProcessResult.cooldownInfo);
          
          // Send cooldown notification to Telegram
          await sendCooldownNotification(fullProcessResult.message, fullProcessResult.cooldownInfo);
          
          // Schedule retry if we have cooldown info
          if (fullProcessResult.cooldownInfo && fullProcessResult.cooldownInfo.remainingSeconds > 0) {
            const retryDelay = Math.min(fullProcessResult.cooldownInfo.remainingSeconds * 1000, 20 * 60 * 1000); // Max 20 minutes
            console.log(`⏰ Scheduling retry in ${Math.floor(retryDelay / 1000)} seconds`);
            
            setTimeout(async () => {
              console.log("🔄 Retrying token collection after cooldown...");
              await performAutoTokenCollection();
            }, retryDelay);
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error in auto collection:", error);
  }
}

// Function to ensure target tab is open
async function ensureTargetTabOpen() {
  try {
    // Check if target tab already exists
    const tabs = await chrome.tabs.query({});
    let targetTab = tabs.find(tab => 
      tab.url && tab.url.includes('tokencursor.io.vn')
    );
    
    if (targetTab) {
      console.log("✅ Found existing target tab");
      return targetTab;
    }
    
    // Create new tab if not found
    console.log("🆕 Creating new target tab");
    const newTab = await chrome.tabs.create({
      url: 'https://tokencursor.io.vn/app',
      active: true
    });
    
    // Wait for tab to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return newTab;
  } catch (error) {
    console.error("❌ Error ensuring target tab:", error);
    return null;
  }
}

// Helper function to send message and wait for response
function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.log("❌ Message error:", chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

// Function to clean up old cursor_tokens files
async function cleanupOldFiles() {
  try {
    if (!chrome.downloads) return;
    
    // Search for all downloads first
    const allDownloads = await new Promise((resolve) => {
      chrome.downloads.search({}, (results) => {
        resolve(results || []);
      });
    });
    
    // Filter cursor_tokens files (including numbered ones)
    const cursorFiles = allDownloads.filter(file => 
      file.filename && file.filename.includes('cursor_tokens')
    );
    
    console.log(`🗑️ Found ${cursorFiles.length} cursor_tokens files to clean up:`);
    cursorFiles.forEach(file => {
      console.log(`  - ${file.filename} (${file.state})`);
    });
    
    // Remove all cursor_tokens files
    let deletedCount = 0;
    for (const file of cursorFiles) {
      try {
        await new Promise((resolve) => {
          chrome.downloads.removeFile(file.id, () => {
            console.log(`🗑️ Removed: ${file.filename}`);
            deletedCount++;
            resolve();
          });
        });
      } catch (e) {
        console.log(`⚠️ Could not remove file: ${file.filename}`, e);
      }
    }
    
    console.log(`✅ Cleanup completed! Deleted ${deletedCount} files.`);
  } catch (error) {
    console.log("⚠️ Cleanup failed:", error.message);
  }
}

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8349265007:AAEGSWe7kfe7Vw2th02Hs4o4HePMdgtzaJM';
const TELEGRAM_CHAT_ID = '709847427';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Function to send token to Telegram
async function sendTokenToTelegram(token) {
  const now = new Date();
  const timestamp = now.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const message = `🔑 CURSOR TOKEN MỚI
⏰ Thời gian: ${timestamp}
🌐 URL: https://tokencursor.io.vn/app
🔐 Key: kabistarvnzxczxc

${token}

🤖 Tự động gửi bởi Key Auto Collector`;

  try {
    console.log("📤 Sending to Telegram API...");
    console.log("URL:", `${TELEGRAM_API_URL}/sendMessage`);
    console.log("Chat ID:", TELEGRAM_CHAT_ID);
    
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📡 Response data:", result);
    
    if (result.ok) {
      console.log("✅ Token sent to Telegram successfully");
      return true;
    } else {
      console.log("❌ Telegram API error:", result.description);
      return false;
    }
  } catch (error) {
    console.log("❌ Failed to send to Telegram:", error.message);
    return false;
  }
}

// Function to send cooldown notification to Telegram
async function sendCooldownNotification(cooldownMessage, cooldownInfo = null) {
  try {
    console.log("📤 Sending cooldown notification to Telegram...");
    
    let message = `⏰ COOLDOWN NOTIFICATION
⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}
🌐 URL: https://tokencursor.io.vn/app
🔐 Key: kabistarvnzxczxc

${cooldownMessage}`;

    if (cooldownInfo) {
      const remainingMinutes = Math.floor(cooldownInfo.remainingSeconds / 60);
      const remainingSeconds = cooldownInfo.remainingSeconds % 60;
      const nextAvailableTime = cooldownInfo.nextAvailableTime ? 
        cooldownInfo.nextAvailableTime.toLocaleString('vi-VN') : 'Unknown';
      
      message += `

📅 Thông tin cooldown:
⏳ Còn lại: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}
🕐 Có thể lấy tiếp: ${nextAvailableTime}`;
    }

    message += `

🤖 Extension sẽ tự động thử lại sau khi hết cooldown`;

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    console.log("📡 Cooldown notification response status:", response.status);
    const result = await response.json();
    console.log("📡 Cooldown notification response data:", result);
    
    if (result.ok) {
      console.log("✅ Cooldown notification sent to Telegram successfully");
      return true;
    } else {
      console.log("❌ Telegram API error for cooldown:", result.description);
      return false;
    }
  } catch (error) {
    console.log("❌ Failed to send cooldown notification to Telegram:", error.message);
    return false;
  }
}

// Function to send token - Telegram only (no file download)
async function saveTokenToFile(token) {
  const now = new Date();
  const timestamp = now.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Save content to storage (for backup only - no file download)
  const fileContent = `========== CURSOR TOKEN ==========
Thời gian lấy: ${timestamp}
URL: https://tokencursor.io.vn/app
Key đăng nhập: kabistarvnzxczxc

${token}

=====================================

`;
  
  await chrome.storage.local.set({ tokenFileContent: fileContent });

  console.log("📤 Attempting to send token to Telegram (NO FILE DOWNLOAD)...");
  
  // Send to Telegram only - NO FILE DOWNLOAD
  try {
    const telegramSuccess = await sendTokenToTelegram(token);
    if (telegramSuccess) {
      console.log("✅ Token sent to Telegram successfully - NO FILE DOWNLOADED");
      return true;
    } else {
      console.log("❌ Telegram send failed");
      return false;
    }
  } catch (error) {
    console.log("❌ Telegram send failed:", error.message);
    return false;
  }
}

// Method 1: Chrome Downloads API - Use unique filename to avoid conflicts
function downloadWithChromeAPI(content, filename = 'cursor_tokens.txt') {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Check if downloads permission is available
      if (!chrome.downloads) {
        reject(new Error("Downloads API not available"));
        return;
      }
      
      // Use a unique filename with timestamp to avoid conflicts
      const timestamp = Date.now();
      const uniqueFilename = `cursor_tokens_${timestamp}.txt`;
      
      chrome.downloads.download({
        url: url,
        filename: uniqueFilename,
        conflictAction: 'overwrite',
        saveAs: false
      }).then((downloadId) => {
        console.log("📥 Download initiated with unique filename:", uniqueFilename);
        
        // Monitor download completion
        const listener = (downloadDelta) => {
          if (downloadDelta.id === downloadId) {
            if (downloadDelta.state && downloadDelta.state.current === 'complete') {
              chrome.downloads.onChanged.removeListener(listener);
              URL.revokeObjectURL(url);
              console.log("✅ Download completed successfully");
              
              // Now rename the file to the desired name
              renameToTargetFile(uniqueFilename, filename).then(() => {
                resolve(true);
              }).catch(() => {
                resolve(true); // Still consider success even if rename fails
              });
            } else if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
              chrome.downloads.onChanged.removeListener(listener);
              URL.revokeObjectURL(url);
              console.log("❌ Download interrupted");
              reject(new Error("Download interrupted"));
            } else if (downloadDelta.error) {
              chrome.downloads.onChanged.removeListener(listener);
              URL.revokeObjectURL(url);
              console.log("❌ Download error:", downloadDelta.error);
              reject(new Error("Download error: " + downloadDelta.error));
            }
          }
        };
        
        chrome.downloads.onChanged.addListener(listener);
        
        // Cleanup after timeout
        setTimeout(() => {
          chrome.downloads.onChanged.removeListener(listener);
          URL.revokeObjectURL(url);
          console.log("⏰ Download timeout - assuming success");
          resolve(true);
        }, 15000);
        
      }).catch((error) => {
        URL.revokeObjectURL(url);
        console.log("❌ Download API error:", error);
        reject(error);
      });
      
    } catch (error) {
      console.log("❌ Download creation error:", error);
      reject(error);
    }
  });
}

// Helper function to rename downloaded file
function renameToTargetFile(currentFilename, targetFilename) {
  return new Promise((resolve, reject) => {
    // Search for the current file
    chrome.downloads.search({filename: currentFilename}, (results) => {
      if (results && results.length > 0) {
        const fileId = results[0].id;
        
        // Try to rename by downloading again with target name
        // This is a workaround since Chrome doesn't have direct rename API
        chrome.downloads.search({filename: targetFilename}, (existingFiles) => {
          if (existingFiles && existingFiles.length > 0) {
            // Remove existing target file first
            chrome.downloads.removeFile(existingFiles[0].id, () => {
              // Download with target name
              chrome.downloads.download({
                url: results[0].url,
                filename: targetFilename,
                conflictAction: 'overwrite',
                saveAs: false
              }).then(() => {
                // Remove the temporary file
                chrome.downloads.removeFile(fileId, () => {
                  console.log("✅ File renamed successfully");
                  resolve();
                });
              }).catch(() => {
                console.log("⚠️ Rename failed, but file exists");
                resolve();
              });
            });
          } else {
            // No existing target file, just download with target name
            chrome.downloads.download({
              url: results[0].url,
              filename: targetFilename,
              conflictAction: 'overwrite',
              saveAs: false
            }).then(() => {
              // Remove the temporary file
              chrome.downloads.removeFile(fileId, () => {
                console.log("✅ File renamed successfully");
                resolve();
              });
            }).catch(() => {
              console.log("⚠️ Rename failed, but file exists");
              resolve();
            });
          }
        });
      } else {
        console.log("⚠️ Could not find file to rename");
        resolve();
      }
    });
  });
}

// Method 2: Programmatic download via content script
async function downloadWithProgrammaticMethod(content, filename = 'cursor_tokens.txt') {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      const result = await sendMessageToTab(tabs[0].id, {
        action: "programmaticDownload",
        content: content,
        filename: filename
      });
      
      if (result && result.success) {
        console.log("✅ Programmatic download successful");
        return true;
      }
    }
    
    // Try with any available tab if active tab doesn't work
    const allTabs = await chrome.tabs.query({});
    for (const tab of allTabs) {
      try {
        const result = await sendMessageToTab(tab.id, {
          action: "programmaticDownload",
          content: content,
          filename: filename
        });
        
        if (result && result.success) {
          console.log("✅ Programmatic download successful on tab:", tab.url);
          return true;
        }
      } catch (e) {
        // Continue to next tab
        continue;
      }
    }
    
    console.log("❌ Programmatic download failed on all tabs");
    return false;
  } catch (error) {
    console.error("❌ Programmatic download error:", error);
    return false;
  }
}

// Method 3: Copy to clipboard
async function copyToClipboard(content) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      const result = await sendMessageToTab(tabs[0].id, {
        action: "copyToClipboard",
        content: content
      });
      
      if (result && result.success) {
        console.log("✅ Clipboard copy successful");
        return true;
      }
    }
    
    // Try with any available tab if active tab doesn't work
    const allTabs = await chrome.tabs.query({});
    for (const tab of allTabs) {
      try {
        const result = await sendMessageToTab(tab.id, {
          action: "copyToClipboard",
          content: content
        });
        
        if (result && result.success) {
          console.log("✅ Clipboard copy successful on tab:", tab.url);
          return true;
        }
      } catch (e) {
        // Continue to next tab
        continue;
      }
    }
    
    console.log("❌ Clipboard copy failed on all tabs");
    return false;
  } catch (error) {
    console.error("❌ Clipboard error:", error);
    return false;
  }
}

// Listen to messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Background received:", request.action);
  
  if (request.action === "saveToken") {
    saveTokenToFile(request.token).then(success => {
      sendResponse({ status: success ? "success" : "failed" });
    }).catch(error => {
      console.error("Save token error:", error);
      sendResponse({ status: "failed", error: error.message });
    });
    return true; // Keep connection open for async response
    
  } else if (request.action === "testDownload") {
    const testContent = `========== TEST DOWNLOAD ==========
Thời gian: ${new Date().toLocaleString('vi-VN')}
URL: Test

This is a test download to verify the extension is working properly.

=====================================`;
    
    // For test, we'll use a separate test file
    downloadWithChromeAPI(testContent, 'test_download.txt').then(success => {
      sendResponse({ status: success ? "success" : "failed" });
    }).catch(error => {
      sendResponse({ status: "failed", error: error.message });
    });
    return true;
    
  } else if (request.action === "startAutoCollection") {
    console.log("🚀 Manual auto collection triggered");
    performAutoTokenCollection().then(() => {
      sendResponse({ status: "success" });
    }).catch(error => {
      sendResponse({ status: "failed", error: error.message });
    });
    return true;
    
  } else if (request.action === "cleanupOldFiles") {
    console.log("🗑️ Manual cleanup triggered");
    cleanupOldFiles().then(() => {
      sendResponse({ status: "success" });
    }).catch(error => {
      sendResponse({ status: "failed", error: error.message });
    });
    return true;
    
  } else if (request.action === "testTelegram") {
    console.log("📱 Test Telegram triggered");
    const testToken = "sk-test1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    sendTokenToTelegram(testToken).then(success => {
      if (success) {
        sendResponse({ status: "success" });
      } else {
        sendResponse({ status: "failed", error: "Failed to send test message" });
      }
    }).catch(error => {
      sendResponse({ status: "failed", error: error.message });
    });
    return true;
    
  } else if (request.action === "sendToken") {
    console.log("📤 Manual send token triggered");
    sendTokenToTelegram(request.token).then(success => {
      if (success) {
        sendResponse({ status: "success" });
      } else {
        sendResponse({ status: "failed", error: "Failed to send token" });
      }
    }).catch(error => {
      sendResponse({ status: "failed", error: error.message });
    });
    return true;
  }
  
  sendResponse({ status: "unknown_action" });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("🔄 Extension started");
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log("🆕 Extension installed");
  } else if (details.reason === 'update') {
    console.log("⬆️ Extension updated");
  }
});

console.log("🚀 Enhanced background script loaded");