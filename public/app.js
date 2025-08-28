class BitcoinWalletScanner {
    constructor() {
        this.workers = [];
        this.isScanning = false;
        this.stats = {
            attempts: 0,
            found: 0,
            totalBtc: 0,
            startTime: null
        };
        
        this.foundWallets = [];
        this.activityLog = [];
        
        this.initializeElements();
        this.bindEvents();
        this.checkServerStatus();
        this.loadFoundWallets();
        
        // Start stats update interval
        setInterval(() => this.updateStats(), 1000);
    }

    initializeElements() {
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.workerCountSelect = document.getElementById('workerCount');
        
        // Status elements
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        
        // Stats elements
        this.attemptsCount = document.getElementById('attemptsCount');
        this.foundCount = document.getElementById('foundCount');
        this.totalBtc = document.getElementById('totalBtc');
        this.scanRate = document.getElementById('scanRate');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Content elements
        this.foundWallets = document.getElementById('foundWallets');
        this.foundBadge = document.getElementById('foundBadge');
        this.activityLogElement = document.getElementById('activityLog');
        
        // Modal elements
        this.walletModal = document.getElementById('walletModal');
        this.modalClose = document.getElementById('modalClose');
        this.walletDetails = document.getElementById('walletDetails');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.generateBtn.addEventListener('click', () => this.generateWallet());
        this.clearBtn.addEventListener('click', () => this.clearStats());
        this.modalClose.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        this.walletModal.addEventListener('click', (e) => {
            if (e.target === this.walletModal) {
                this.closeModal();
            }
        });
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.status === 'online') {
                this.setStatus('online', 'Server Online');
                this.addActivity('System connected to server successfully');
            } else {
                this.setStatus('offline', 'Server Error');
            }
        } catch (error) {
            console.error('Server status check failed:', error);
            this.setStatus('offline', 'Server Offline');
            this.addActivity('Failed to connect to server');
        }
    }

    async loadFoundWallets() {
        try {
            const response = await fetch('/api/found-wallets');
            const data = await response.json();
            
            this.foundWallets = data.wallets || [];
            this.stats.found = data.count || 0;
            this.stats.totalBtc = data.totalBalance || 0;
            
            this.updateFoundWalletsDisplay();
            this.updateStats();
            
            if (this.foundWallets.length > 0) {
                this.addActivity(`Loaded ${this.foundWallets.length} previously found wallets`);
            }
        } catch (error) {
            console.error('Error loading found wallets:', error);
        }
    }

    setStatus(status, text) {
        this.statusDot.className = `status-dot ${status === 'offline' ? 'offline' : ''}`;
        this.statusText.textContent = text;
    }

    async startScanning() {
        if (this.isScanning) return;
        
        this.isScanning = true;
        this.stats.startTime = Date.now();
        this.stats.attempts = 0;
        
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.workerCountSelect.disabled = true;
        
        const workerCount = parseInt(this.workerCountSelect.value);
        this.addActivity(`Starting scan with ${workerCount} worker(s)`);
        
        // Create workers
        for (let i = 0; i < workerCount; i++) {
            this.createWorker(i);
        }
        
        this.updateProgressText('Scanning for Bitcoin wallets...');
    }

    stopScanning() {
        if (!this.isScanning) return;
        
        this.isScanning = false;
        
        // Terminate all workers
        this.workers.forEach(worker => {
            worker.terminate();
        });
        this.workers = [];
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.workerCountSelect.disabled = false;
        
        this.updateProgressText('Scanning stopped');
        this.addActivity('Scanning stopped by user');
    }

    createWorker(workerId) {
        const worker = new Worker('worker.js');
        
        worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            switch (type) {
                case 'attempt':
                    this.stats.attempts++;
                    break;
                    
                case 'found':
                    this.handleFoundWallet(data);
                    break;
                    
                case 'error':
                    console.error(`Worker ${workerId} error:`, data);
                    this.addActivity(`Worker ${workerId} encountered an error`);
                    break;
            }
        };
        
        worker.onerror = (error) => {
            console.error(`Worker ${workerId} error:`, error);
            this.addActivity(`Worker ${workerId} crashed`);
        };
        
        // Start the worker
        worker.postMessage({ type: 'start' });
        this.workers.push(worker);
    }

    handleFoundWallet(wallet) {
        this.foundWallets.unshift(wallet);
        this.stats.found++;
        this.stats.totalBtc += wallet.balance;
        
        this.updateFoundWalletsDisplay();
        this.addActivity(`🎉 FOUND WALLET: ${wallet.address} with ${wallet.balance} BTC!`);
        
        // Play notification sound (if possible)
        this.playNotificationSound();
    }

    async generateWallet() {
        try {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = '<span class="btn-icon">⏳</span>Generating...';
            
            const response = await fetch('/api/generate-wallet', {
                method: 'POST'
            });
            
            const wallet = await response.json();
            this.showWalletModal(wallet);
            this.addActivity('Generated new Bitcoin wallet');
            
        } catch (error) {
            console.error('Error generating wallet:', error);
            this.addActivity('Failed to generate wallet');
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<span class="btn-icon">🔑</span>Generate Wallet';
        }
    }

    showWalletModal(wallet) {
        const details = `
            <div class="wallet-detail">
                <label>Private Key:</label>
                <div class="value">${wallet.privateKey}</div>
            </div>
            <div class="wallet-detail">
                <label>Public Key:</label>
                <div class="value">${wallet.publicKey}</div>
            </div>
            <div class="wallet-detail">
                <label>Address (P2PKH):</label>
                <div class="value">${wallet.address}</div>
            </div>
            <div class="wallet-detail">
                <label>Address (Bech32):</label>
                <div class="value">${wallet.bech32Address}</div>
            </div>
            <div class="wallet-detail">
                <label>WIF:</label>
                <div class="value">${wallet.wif}</div>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
                <strong>⚠️ Warning:</strong> Never share your private key with anyone!
            </div>
        `;
        
        this.walletDetails.innerHTML = details;
        this.walletModal.style.display = 'block';
    }

    closeModal() {
        this.walletModal.style.display = 'none';
    }

    clearStats() {
        if (confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
            this.stats = {
                attempts: 0,
                found: 0,
                totalBtc: 0,
                startTime: null
            };
            
            this.activityLog = [];
            this.updateStats();
            this.updateActivityLog();
            this.addActivity('Statistics cleared');
        }
    }

    updateStats() {
        this.attemptsCount.textContent = this.formatNumber(this.stats.attempts);
        this.foundCount.textContent = this.formatNumber(this.stats.found);
        this.totalBtc.textContent = this.stats.totalBtc.toFixed(8);
        this.foundBadge.textContent = this.stats.found;
        
        // Calculate scan rate
        if (this.stats.startTime && this.isScanning) {
            const elapsedMinutes = (Date.now() - this.stats.startTime) / (1000 * 60);
            const rate = elapsedMinutes > 0 ? Math.round(this.stats.attempts / elapsedMinutes) : 0;
            this.scanRate.textContent = this.formatNumber(rate);
            
            // Update progress bar (just for visual effect)
            const progress = Math.min((this.stats.attempts % 1000) / 10, 100);
            this.progressFill.style.width = `${progress}%`;
        } else {
            this.scanRate.textContent = '0';
            this.progressFill.style.width = '0%';
        }
    }

    updateFoundWalletsDisplay() {
        if (this.foundWallets.length === 0) {
            this.foundWallets.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>No wallets with balance found yet.</p>
                    <p>Start scanning to find Bitcoin wallets!</p>
                </div>
            `;
            return;
        }
        
        const walletsHtml = this.foundWallets.map(wallet => `
            <div class="wallet-item">
                <div class="wallet-info">
                    <div class="wallet-address">${wallet.address}</div>
                    <div class="wallet-balance">₿ ${wallet.balance.toFixed(8)}</div>
                    <div class="wallet-time">${new Date(wallet.foundAt).toLocaleString()}</div>
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${wallet.address}')">
                    📋 Copy
                </button>
            </div>
        `).join('');
        
        this.foundWallets.innerHTML = walletsHtml;
    }

    addActivity(message) {
        const time = new Date().toLocaleTimeString();
        this.activityLog.unshift({ time, message });
        
        // Keep only last 50 activities
        if (this.activityLog.length > 50) {
            this.activityLog = this.activityLog.slice(0, 50);
        }
        
        this.updateActivityLog();
    }

    updateActivityLog() {
        if (this.activityLog.length === 0) {
            this.activityLogElement.innerHTML = `
                <div class="activity-item">
                    <span class="activity-time">Ready</span>
                    <span class="activity-message">System initialized and ready to scan</span>
                </div>
            `;
            return;
        }
        
        const activitiesHtml = this.activityLog.map(activity => `
            <div class="activity-item">
                <span class="activity-time">${activity.time}</span>
                <span class="activity-message">${activity.message}</span>
            </div>
        `).join('');
        
        this.activityLogElement.innerHTML = activitiesHtml;
    }

    updateProgressText(text) {
        this.progressText.textContent = text;
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // Ignore audio errors
        }
    }

    // Educational Tools Methods
    async validateAddress() {
        const addressInput = document.getElementById('addressInput');
        const validationResult = document.getElementById('validationResult');
        const address = addressInput.value.trim();
        
        if (!address) {
            this.showValidationResult('Please enter a Bitcoin address', false);
            return;
        }
        
        try {
            const response = await fetch(`/api/validate/${encodeURIComponent(address)}`);
            const data = await response.json();
            
            if (data.isValid) {
                this.showValidationResult(`✅ Valid Bitcoin Address\nFormat: ${data.format}\nAddress: ${address}`, true);
                this.addActivity(`Validated address: ${address} - Valid`);
            } else {
                this.showValidationResult(`❌ Invalid Bitcoin Address\nThe address format is not recognized as a valid Bitcoin address.`, false);
                this.addActivity(`Validated address: ${address} - Invalid`);
            }
        } catch (error) {
            console.error('Address validation error:', error);
            this.showValidationResult('❌ Error validating address. Please try again.', false);
        }
    }
    
    showValidationResult(message, isValid) {
        const validationResult = document.getElementById('validationResult');
        validationResult.textContent = message;
        validationResult.className = `validation-result ${isValid ? 'valid' : 'invalid'}`;
    }
    
    async analyzePrivateKey() {
        const privateKeyInput = document.getElementById('privateKeyInput');
        const analysisResult = document.getElementById('analysisResult');
        const privateKey = privateKeyInput.value.trim();
        
        if (!privateKey) {
            this.showAnalysisResult('Please enter a private key in hexadecimal format');
            return;
        }
        
        // Validate hex format
        if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
            this.showAnalysisResult('❌ Invalid private key format. Must be 64 hexadecimal characters.');
            return;
        }
        
        try {
            const response = await fetch('/api/analyze-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ privateKey })
            });
            
            const data = await response.json();
            
            if (data.error) {
                this.showAnalysisResult(`❌ ${data.error}`);
                return;
            }
            
            const analysis = `✅ Private Key Analysis:

Private Key: ${data.privateKey}
Public Key: ${data.publicKey}
WIF Format: ${data.wif}

Generated Addresses:
• P2PKH (Legacy): ${data.addresses.p2pkh || 'N/A'}
• P2WPKH (Bech32): ${data.addresses.p2wpkh || 'N/A'}
• P2SH-P2WPKH (Wrapped): ${data.addresses.p2sh || 'N/A'}

⚠️ Never share this private key with anyone!`;
            
            this.showAnalysisResult(analysis);
            this.addActivity('Analyzed private key and generated addresses');
            
        } catch (error) {
            console.error('Private key analysis error:', error);
            this.showAnalysisResult('❌ Error analyzing private key. Please try again.');
        }
    }
    
    showAnalysisResult(message) {
        const analysisResult = document.getElementById('analysisResult');
        analysisResult.textContent = message;
        analysisResult.className = 'analysis-result show';
    }
    
    async demonstrateAddressVariations() {
        const addressVariations = document.getElementById('addressVariations');
        
        try {
            // Generate a new wallet for demonstration
            const response = await fetch('/api/generate-wallet', {
                method: 'POST'
            });
            
            const wallet = await response.json();
            
            // Get all address variations
            const variationsResponse = await fetch('/api/address-variations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ privateKey: wallet.privateKey })
            });
            
            const variations = await variationsResponse.json();
            
            let html = `
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(247, 147, 26, 0.1); border-radius: 8px; border: 1px solid rgba(247, 147, 26, 0.3);">
                    <strong>🔑 Private Key:</strong> ${wallet.privateKey}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>All possible address formats from this single private key:</strong>
                </div>
            `;
            
            if (variations.p2pkh) {
                html += this.createVariationHtml('P2PKH (Legacy)', variations.p2pkh, 'Most common format, starts with "1"');
            }
            
            if (variations.p2wpkh) {
                html += this.createVariationHtml('P2WPKH (Bech32)', variations.p2wpkh, 'SegWit format, starts with "bc1"');
            }
            
            if (variations.p2sh) {
                html += this.createVariationHtml('P2SH-P2WPKH', variations.p2sh, 'Wrapped SegWit, starts with "3"');
            }
            
            addressVariations.innerHTML = html;
            this.addActivity('Generated address format demonstration');
            
        } catch (error) {
            console.error('Address variations error:', error);
            addressVariations.innerHTML = '<p style="color: #ef4444;">❌ Error generating address variations</p>';
        }
    }
    
    createVariationHtml(type, address, description) {
        return `
            <div class="address-variation">
                <div class="variation-type">${type}</div>
                <div class="variation-address">${address}</div>
                <button class="copy-variation-btn" onclick="copyToClipboard('${address}')">📋</button>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px; padding-left: 120px;">
                ${description}
            </div>
        `;
    }
}

// Global function for copying to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const notification = document.createElement('div');
        notification.textContent = 'Copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Initialize the scanner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BitcoinWalletScanner();
});