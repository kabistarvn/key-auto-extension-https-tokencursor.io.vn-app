// content.js - Fixed version

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  
  try {
    switch (request.action) {
      case "autoLogin":
        autoLogin(request.key).then(success => {
          sendResponse({ success: success });
        });
        return true; // Keep message channel open
        
      case "clickGetToken":
        const clickResult = clickGetTokenButton();
        sendResponse({ success: clickResult });
        break;
        
      case "getTokenAfterClick":
        // Return a promise for async operation
        getTokenAfterClick().then(token => {
          sendResponse({ token: token });
        });
        return true; // Keep message channel open
        
      case "extractToken":
        const extractedToken = extractTokenFromPage();
        sendResponse({ token: extractedToken });
        break;
        
      case "programmaticDownload":
        programmaticDownload(request.content, request.filename).then(success => {
          sendResponse({ success: success });
        });
        return true; // Keep message channel open
        
      case "copyToClipboard":
        copyToClipboardMethod(request.content).then(success => {
          sendResponse({ success: success });
        });
        return true; // Keep message channel open
        
      case "fullAutoProcess":
        // Complete automated process: check login, click button, get token, save file
        fullAutoProcess(request.key).then(result => {
          sendResponse({ success: result.success, token: result.token, message: result.message });
        });
        return true; // Keep message channel open
        
      default:
        sendResponse({ success: false, error: "Unknown action" });
    }
  } catch (error) {
    console.error("Error in content script:", error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Auto-login function - improved to check if already logged in
async function autoLogin(key) {
  console.log("Attempting auto-login with key:", key);
  
  try {
    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }
    
    // Wait a bit more for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // First check if already logged in by looking for account info or "Lấy Token" button
    // Check if already logged in by looking for specific indicators
    // Must be on the app page, not login page
    const currentUrl = window.location.href;
    const isOnAppPage = currentUrl.includes('/app') || currentUrl.includes('tokencursor.io.vn/app');
    
    if (!isOnAppPage) {
      console.log("❌ Not on app page, need to navigate first");
      return false;
    }
    
    // Check for login form elements (if present, not logged in)
    const loginForm = document.querySelector('input[type="password"], input[placeholder*="key"], input[placeholder*="Key"]');
    if (loginForm) {
      console.log("❌ Login form detected, user not logged in");
      return false;
    }
    
    // Check for logged in indicators
    const loggedInIndicators = [
      'text:contains("Thông tin tài khoản")',
      'text:contains("Account Information")',
      'text:contains("Key ID")',
      'text:contains("Trạng thái")',
      'button:contains("Lấy Token")',
      'button:contains("Get Token")'
    ];
    
    let alreadyLoggedIn = false;
    for (let indicator of loggedInIndicators) {
      if (indicator.includes(':contains(')) {
        const text = indicator.match(/contains\("([^"]+)"\)/)[1];
        if (document.body.textContent.includes(text)) {
          alreadyLoggedIn = true;
          console.log("✅ Already logged in detected:", text);
          break;
        }
      }
    }
    
    if (alreadyLoggedIn) {
      console.log("✅ User already logged in, skipping login process");
      showNotification("Đã đăng nhập sẵn!", "success");
      return true;
    }
    
    // If not logged in, proceed with login process
    console.log("User not logged in, attempting login...");
    showNotification("Đang thực hiện đăng nhập...", "info");
    
    // Look for login input field
    const loginSelectors = [
      'input[type="text"]',
      'input[placeholder*="key"]',
      'input[placeholder*="Key"]',
      'input[placeholder*="đăng nhập"]',
      'input[placeholder*="Đăng nhập"]',
      'input[name*="key"]',
      'input[name*="Key"]',
      'input[id*="key"]',
      'input[id*="Key"]',
      'input[class*="key"]',
      'input[class*="Key"]'
    ];
    
    let loginInput = null;
    for (let selector of loginSelectors) {
      const input = document.querySelector(selector);
      if (input && input.offsetParent !== null) { // Check if visible
        loginInput = input;
        console.log("Found login input with selector:", selector);
        break;
      }
    }
    
    if (!loginInput) {
      console.log("❌ No login input found");
      return false;
    }
    
    // Clear and fill the input
    loginInput.focus();
    loginInput.value = '';
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Type the key character by character
    for (let char of key) {
      loginInput.value += char;
      loginInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Trigger change event
    loginInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for login button
    const loginButtonSelectors = [
      'button:contains("Đăng nhập")',
      'button:contains("Đăng Nhập")',
      'button:contains("Login")',
      'button:contains("LOGIN")',
      'input[type="submit"]',
      'button[type="submit"]',
      '.btn-primary',
      '[class*="btn"][class*="primary"]',
      'button[class*="primary"]'
    ];
    
    let loginButton = null;
    for (let selector of loginButtonSelectors) {
      if (selector.includes(':contains(')) {
        const text = selector.match(/contains\("([^"]+)"\)/)[1];
        const buttons = document.querySelectorAll('button, input[type="submit"]');
        for (let button of buttons) {
          const buttonText = button.textContent.trim() || button.innerText.trim() || button.value;
          if (buttonText.includes(text)) {
            loginButton = button;
            console.log("Found login button with text:", text);
            break;
          }
        }
      } else {
        const button = document.querySelector(selector);
        if (button && button.offsetParent !== null) {
          loginButton = button;
          console.log("Found login button with selector:", selector);
          break;
        }
      }
      if (loginButton) break;
    }
    
    if (!loginButton) {
      console.log("❌ No login button found");
      return false;
    }
    
    // Click the login button
    console.log("Clicking login button");
    loginButton.click();
    
    // Wait for login to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if login was successful by looking for success indicators
    const successIndicators = [
      'text:contains("Token")',
      'text:contains("token")',
      'text:contains("Lấy Token")',
      'text:contains("Get Token")',
      'button:contains("Lấy Token")',
      'button:contains("Get Token")'
    ];
    
    let loginSuccess = false;
    for (let indicator of successIndicators) {
      if (indicator.includes(':contains(')) {
        const text = indicator.match(/contains\("([^"]+)"\)/)[1];
        if (document.body.textContent.includes(text)) {
          loginSuccess = true;
          console.log("✅ Login success detected:", text);
          break;
        }
      }
    }
    
    if (loginSuccess) {
      console.log("✅ Auto-login successful");
      showNotification("Đăng nhập thành công!", "success");
      return true;
    } else {
      console.log("❌ Auto-login failed - no success indicators found");
      showNotification("Đăng nhập thất bại!", "error");
      return false;
    }
    
  } catch (error) {
    console.error("❌ Auto-login error:", error);
    showNotification("Lỗi đăng nhập: " + error.message, "error");
    return false;
  }
}

// Click "Get Token" button - improved with more selectors
function clickGetTokenButton() {
  console.log("Attempting to click get token button");
  
  // First, let's look for buttons with specific text content
  const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  console.log("Found", allButtons.length, "buttons on page");
  
  for (let button of allButtons) {
    const buttonText = (button.textContent || button.innerText || button.value || '').trim();
    console.log("Checking button text:", buttonText);
    
    // Check for "Lấy Token" button or cooldown button
    if (buttonText === 'Lấy Token' || buttonText === 'Get Token') {
      console.log("✅ Found 'Lấy Token' button:", buttonText);
      
      // Check if button is visible and clickable
      if (button.offsetParent !== null && !button.disabled) {
        console.log("✅ Button is visible and clickable, clicking...");
        button.click();
        return true;
      } else {
        console.log("❌ Button found but not clickable (disabled or hidden)");
      }
    }
    
    // Check for cooldown button (e.g., "Chờ 12:07 nữa")
    if (buttonText.includes('Chờ') && buttonText.includes('nữa')) {
      console.log("⏰ Found cooldown button:", buttonText);
      
      // Try to parse cooldown time from button text
      const cooldownInfo = parseCooldownTime(buttonText);
      if (cooldownInfo) {
        console.log("⏰ Cooldown info:", cooldownInfo);
        return { cooldown: true, cooldownInfo: cooldownInfo };
      }
      
      console.log("❌ Token button is on cooldown, cannot click yet");
      return false; // Return false to indicate cooldown
    }
    
    // Skip logout buttons
    if (buttonText.includes('Đăng xuất') || buttonText.includes('Logout')) {
      console.log("⏭️ Skipping logout button:", buttonText);
      continue;
    }
  }
  
  // If no text-based match, try CSS selectors
  const selectors = [
    // Common button selectors
    'button[class*="primary"]',
    'button[class*="btn"]',
    '.btn-primary',
    '[class*="btn"][class*="primary"]',
    'button.w-full',
    '.w-full.btn-primary',
    // Look for buttons in main content area
    'main button',
    '.card button',
    'div[class*="space-y"] button',
    // Look for blue buttons (common for primary actions)
    'button[style*="background"]',
    'button[class*="blue"]'
  ];
  
  for (let selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null && !element.disabled) {
        console.log("✅ Found clickable element with selector:", selector);
        element.click();
        return true;
      }
    } catch (e) {
      console.log("Error with selector:", selector, e);
    }
  }
  
  // Last resort: try to find any button that might be the token button
  console.log("🔄 Trying last resort method - looking for any clickable button...");
  for (let button of allButtons) {
    if (button.offsetParent !== null && !button.disabled) {
      const buttonText = (button.textContent || button.innerText || button.value || '').trim();
      
      // Skip logout buttons
      if (buttonText.includes('Đăng xuất') || buttonText.includes('Logout')) {
        console.log("⏭️ Skipping logout button in last resort:", buttonText);
        continue;
      }
      
      const rect = button.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 30) { // Reasonable button size
        console.log("✅ Found potential button, clicking:", buttonText);
        button.click();
        return true;
      }
    }
  }
  
  console.log("❌ No clickable element found");
  return false;
}

// Parse cooldown time from button text (e.g., "Chờ 12:07 nữa")
function parseCooldownTime(buttonText) {
  try {
    // Extract time pattern like "12:07" from "Chờ 12:07 nữa"
    const timeMatch = buttonText.match(/Chờ\s+(\d{1,2}):(\d{2})\s+nữa/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      const totalSeconds = minutes * 60 + seconds;
      
      return {
        minutes: minutes,
        seconds: seconds,
        totalSeconds: totalSeconds,
        text: buttonText
      };
    }
  } catch (error) {
    console.log("❌ Error parsing cooldown time:", error);
  }
  return null;
}

// Parse last token time from page text (e.g., "21:39:41 06/09/2025")
function parseLastTokenTime() {
  try {
    // Look for "Lần lấy token cuối" text
    const lastTokenText = document.body.textContent;
    const timeMatch = lastTokenText.match(/Lần lấy token cuối\s*(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})/);
    
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]);
      const day = parseInt(timeMatch[4]);
      const month = parseInt(timeMatch[5]);
      const year = parseInt(timeMatch[6]);
      
      // Create date object (assuming current year if not specified)
      const lastTokenDate = new Date(year, month - 1, day, hours, minutes, seconds);
      const now = new Date();
      
      // Calculate cooldown (20 minutes 5 seconds = 1205 seconds)
      const cooldownSeconds = 20 * 60 + 5; // 1205 seconds
      const nextAvailableTime = new Date(lastTokenDate.getTime() + cooldownSeconds * 1000);
      const remainingSeconds = Math.max(0, Math.floor((nextAvailableTime.getTime() - now.getTime()) / 1000));
      
      return {
        lastTokenTime: lastTokenDate,
        nextAvailableTime: nextAvailableTime,
        remainingSeconds: remainingSeconds,
        cooldownSeconds: cooldownSeconds,
        isReady: remainingSeconds <= 0
      };
    }
  } catch (error) {
    console.log("❌ Error parsing last token time:", error);
  }
  return null;
}

// Extract token from page - improved validation
function extractTokenFromPage() {
  console.log("Extracting token from page");
  
  // 1. Look for token in all text content first (most common case)
  const allText = document.body.textContent || document.body.innerText || '';
  console.log("Page text content length:", allText.length);
  
  // Look for patterns that might be tokens in the text
  const tokenPatterns = [
    /sk-[A-Za-z0-9]{32,}/g, // OpenAI style tokens
    /[A-Za-z0-9\-_]{40,}/g, // General token patterns
    /[A-Fa-f0-9]{32,}/g, // Hex tokens
    /[A-Za-z0-9+/]{40,}={0,2}/g, // Base64 tokens
    /eyJ[A-Za-z0-9\-_\.]+/g // JWT tokens
  ];
  
  for (let pattern of tokenPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      for (let match of matches) {
        if (isValidToken(match)) {
          console.log("✅ Found token in page text:", match.substring(0, 20) + "...");
          return match;
        }
      }
    }
  }
  
  // 2. Look in specific elements that might contain tokens
  const tokenSelectors = [
    'code',
    'pre',
    '.font-mono',
    '[style*="font-family: monospace"]',
    '[style*="font-family:monospace"]',
    'textarea',
    'input[type="text"]',
    '[class*="token"]',
    '[id*="token"]',
    'div[class*="token"]',
    'span[class*="token"]'
  ];
  
  for (let selector of tokenSelectors) {
    const elements = document.querySelectorAll(selector);
    console.log("Found", elements.length, "elements with selector:", selector);
    for (let element of elements) {
      const text = element.textContent || element.innerText || element.value;
      if (text && isValidToken(text.trim())) {
        console.log("✅ Found token in element:", selector, text.substring(0, 20) + "...");
        return text.trim();
      }
    }
  }
  
  // 3. Look for any element that might contain a long string (potential token)
  const allElements = document.querySelectorAll('*');
  for (let element of allElements) {
    const text = element.textContent || element.innerText || element.value;
    if (text && text.length > 30 && isValidToken(text.trim())) {
      console.log("✅ Found token in element:", element.tagName, text.substring(0, 20) + "...");
      return text.trim();
    }
  }
  
  // 4. Look in localStorage/sessionStorage
  try {
    for (let key in localStorage) {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('key')) {
        const value = localStorage[key];
        if (isValidToken(value)) {
          console.log("✅ Found token in localStorage:", key);
          return value;
        }
      }
    }
    
    for (let key in sessionStorage) {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('key')) {
        const value = sessionStorage[key];
        if (isValidToken(value)) {
          console.log("✅ Found token in sessionStorage:", key);
          return value;
        }
      }
    }
  } catch (e) {
    console.log("Cannot access storage:", e);
  }
  
  // 5. Look in cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name && name.toLowerCase().includes('token') && value) {
      if (isValidToken(value)) {
        console.log("✅ Found token in cookies:", name);
        return value;
      }
    }
  }
  
  console.log("❌ No valid token found");
  return null;
}

// Get token after button click - improved async handling
async function getTokenAfterClick() {
  console.log("Getting token after button click");
  
  // Wait for DOM to update after click
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const token = extractTokenFromPage();
  return token;
}

// Improved token validation
function isValidToken(text) {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  // Exclude common UI text that's not tokens
  const excludePatterns = [
    /^(Thông tin|Key ID|Trạng thái|Số token|Lần lấy|Bạn cần chờ|Lấy Token|Get Token)$/i,
    /^(.*tài khoản.*|.*còn hạn.*|.*đã nhận.*|.*cuối.*|.*nữa.*|.*tiếp theo.*)$/i,
    /^\d{1,3}$/, // Just numbers
    /^(AM|PM|\d{1,2}:\d{2}:\d{2})$/i, // Time formats
    /^(\d{1,2}\/\d{1,2}\/\d{4})$/ // Date formats
  ];
  
  for (let pattern of excludePatterns) {
    if (pattern.test(trimmed)) {
      console.log("Excluded text:", trimmed);
      return false;
    }
  }
  
  // Token should have minimum length
  if (trimmed.length < 20) return false;
  
  // Check for valid token patterns
  const tokenPatterns = [
    /^[A-Za-z0-9\-_]{32,}$/, // Alphanumeric with dash/underscore
    /^[A-Fa-f0-9]{32,}$/, // Hex hash
    /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64
    /^sk-[A-Za-z0-9]{32,}$/, // OpenAI style
    /^[A-Za-z0-9\-_\.]{40,}$/, // JWT style
    /^eyJ[A-Za-z0-9\-_\.]+$/ // JWT token starting with eyJ
  ];
  
  for (let pattern of tokenPatterns) {
    if (pattern.test(trimmed)) {
      console.log("Valid token pattern found");
      return true;
    }
  }
  
  return false;
}

// Programmatic download through DOM - OVERWRITE mode
async function programmaticDownload(content, filename = 'cursor_tokens.txt') {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create download link - this will always overwrite the file
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename; // This forces overwrite in most browsers
    downloadLink.style.display = 'none';
    
    // Add to DOM and trigger download
    document.body.appendChild(downloadLink);
    
    // Trigger click with user gesture simulation
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    downloadLink.dispatchEvent(clickEvent);
    
    // Clean up
    setTimeout(() => {
      if (downloadLink.parentNode) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    }, 1000);
    
    console.log("✅ Programmatic download initiated (OVERWRITE mode)");
    showNotification("File đang được tải xuống (ghi đè)!", "success");
    return true;
    
  } catch (error) {
    console.error("❌ Programmatic download failed:", error);
    return false;
  }
}

// Copy to clipboard as fallback
async function copyToClipboardMethod(content) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
      console.log("✅ Content copied to clipboard");
      showNotification("Token đã được copy vào clipboard!", "success");
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (result) {
        console.log("✅ Content copied to clipboard (fallback method)");
        showNotification("Token đã được copy vào clipboard!", "success");
        return true;
      } else {
        console.log("❌ Failed to copy to clipboard");
        return false;
      }
    }
  } catch (error) {
    console.error("❌ Clipboard copy failed:", error);
    return false;
  }
}

// Show notification to user
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('token-collector-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'token-collector-notification';
  notification.innerHTML = message;
  
  // Style notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation CSS if not exists
  if (!document.getElementById('token-collector-styles')) {
    const style = document.createElement('style');
    style.id = 'token-collector-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Watch for tokens - improved to avoid false positives
function watchForTokens() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Only check for tokens in specific contexts
            if (node.matches && (
              node.matches('code, pre, textarea, input[type="text"]') ||
              node.querySelector('code, pre, textarea, input[type="text"]')
            )) {
              const token = extractTokenFromElement(node);
              if (token) {
                console.log("New valid token detected:", token.substring(0, 20) + "...");
                // Send token to background script
                chrome.runtime.sendMessage({
                  action: "saveToken",
                  token: token
                });
              }
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Extract token from specific element
function extractTokenFromElement(element) {
  if (!element) return null;
  
  const text = element.textContent || element.innerText || element.value;
  if (text && isValidToken(text.trim())) {
    return text.trim();
  }
  
  // Look in child elements that might contain tokens
  const tokenElements = element.querySelectorAll('code, pre, textarea, input[type="text"]');
  for (let el of tokenElements) {
    const text = el.textContent || el.innerText || el.value;
    if (text && isValidToken(text.trim())) {
      return text.trim();
    }
  }
  
  return null;
}

// Full automated process: check login, click button, get token, save file
async function fullAutoProcess(key) {
  console.log("🚀 Starting full automated process...");
  
  try {
    // Step 0: Check current URL and navigate if needed
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl);
    
    if (currentUrl.includes('/login') || currentUrl.includes('tokencursor.io.vn/login')) {
      console.log("📍 Currently on login page, navigating to app page...");
      window.location.href = 'https://tokencursor.io.vn/app';
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for navigation
    }
    
    // Step 1: Check if already logged in or attempt login
    console.log("Step 1: Checking login status...");
    const loginResult = await autoLogin(key);
    
    if (!loginResult) {
      return {
        success: false,
        token: null,
        message: "Login failed"
      };
    }
    
    console.log("✅ Step 1 completed: Login check successful");
    
    // Step 2: Check cooldown status based on last token time
    console.log("Step 2: Checking cooldown status...");
    const lastTokenInfo = parseLastTokenTime();
    if (lastTokenInfo) {
      console.log("📅 Last token time:", lastTokenInfo.lastTokenTime.toLocaleString('vi-VN'));
      console.log("⏰ Next available time:", lastTokenInfo.nextAvailableTime.toLocaleString('vi-VN'));
      console.log("⏳ Remaining seconds:", lastTokenInfo.remainingSeconds);
      
      if (!lastTokenInfo.isReady) {
        const remainingMinutes = Math.floor(lastTokenInfo.remainingSeconds / 60);
        const remainingSeconds = lastTokenInfo.remainingSeconds % 60;
        const cooldownMessage = `Token button is on cooldown: Chờ ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} nữa`;
        
        console.log("⏰ Token not ready yet:", cooldownMessage);
        return {
          success: false,
          token: null,
          message: cooldownMessage,
          cooldown: true,
          cooldownInfo: {
            remainingSeconds: lastTokenInfo.remainingSeconds,
            nextAvailableTime: lastTokenInfo.nextAvailableTime
          }
        };
      } else {
        console.log("✅ Token is ready to be collected!");
      }
    }
    
    // Step 3: Wait for page to be ready
    console.log("Step 3: Waiting for page to be ready...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Click "Lấy Token" button
    console.log("Step 4: Clicking 'Lấy Token' button...");
    const clickResult = clickGetTokenButton();
    
    if (clickResult === false) {
      // Check if it's cooldown issue
      const cooldownButton = document.querySelector('button[disabled]');
      if (cooldownButton && cooldownButton.textContent.includes('Chờ')) {
        const cooldownText = cooldownButton.textContent.trim();
        console.log("⏰ Token button is on cooldown:", cooldownText);
        return {
          success: false,
          token: null,
          message: `Token button is on cooldown: ${cooldownText}`,
          cooldown: true
        };
      }
      
      return {
        success: false,
        token: null,
        message: "Failed to click get token button"
      };
    }
    
    console.log("✅ Step 4 completed: Button clicked successfully");
    
    // Step 5: Wait for token to appear
    console.log("Step 5: Waiting for token to appear...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 6: Extract token
    console.log("Step 6: Extracting token...");
    const token = extractTokenFromPage();
    
    if (!token) {
      // Try again after a bit more wait
      console.log("🔄 Token not found, trying again...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      const retryToken = extractTokenFromPage();
      
      if (!retryToken) {
        return {
          success: false,
          token: null,
          message: "No token found after clicking button"
        };
      }
      
      console.log("✅ Step 5 completed: Token found on retry");
      return {
        success: true,
        token: retryToken,
        message: "Token extracted successfully"
      };
    }
    
    console.log("✅ Step 5 completed: Token extracted successfully");
    
    // Step 6: Send token to background script for Telegram (no file download)
    console.log("Step 6: Sending token to background script for Telegram...");
    
    // Send token to background script which will handle Telegram sending
    chrome.runtime.sendMessage({
      action: "saveToken",
      token: token
    }, (response) => {
      if (response && response.status === "success") {
        console.log("✅ Step 6 completed: Token sent to Telegram successfully");
        showNotification("Token đã được gửi qua Telegram!", "success");
      } else {
        console.log("❌ Step 6 failed: Could not send token to Telegram");
        showNotification("Lỗi gửi token qua Telegram!", "error");
      }
    });
    
    // Return success immediately since Telegram sending is handled asynchronously
    return {
      success: true,
      token: token,
      message: "Complete process successful - token sent to Telegram"
    };
    
  } catch (error) {
    console.error("❌ Full auto process error:", error);
    return {
      success: false,
      token: null,
      message: "Error: " + error.message
    };
  }
}

// Initialize watcher when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchForTokens);
} else {
  watchForTokens();
}

console.log("Enhanced content script loaded and ready");