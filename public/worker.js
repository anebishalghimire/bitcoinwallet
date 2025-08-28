class WalletScannerWorker {
    constructor() {
        this.isRunning = false;
        this.scanCount = 0;
    }

    async start() {
        this.isRunning = true;
        this.scanCount = 0;
        
        while (this.isRunning) {
            try {
                await this.scanWallet();
                this.scanCount++;
                
                // Report attempt every 10 scans to reduce message overhead
                if (this.scanCount % 10 === 0) {
                    self.postMessage({
                        type: 'attempt',
                        data: { count: 10 }
                    });
                }
                
                // Small delay to prevent overwhelming the server
                await this.sleep(100);
                
            } catch (error) {
                self.postMessage({
                    type: 'error',
                    data: error.message
                });
                
                // Wait longer on error to avoid spam
                await this.sleep(2000);
            }
        }
    }

    async scanWallet() {
        try {
            const response = await fetch('/api/scan-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.hasBalance) {
                self.postMessage({
                    type: 'found',
                    data: {
                        address: result.address,
                        balance: result.balance,
                        foundAt: new Date().toISOString()
                    }
                });
            }
            
        } catch (error) {
            throw new Error(`Scan failed: ${error.message}`);
        }
    }

    stop() {
        this.isRunning = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Worker message handler
const worker = new WalletScannerWorker();

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'start':
            worker.start();
            break;
            
        case 'stop':
            worker.stop();
            break;
            
        default:
            console.error('Unknown message type:', type);
    }
};

// Handle worker errors
self.onerror = function(error) {
    self.postMessage({
        type: 'error',
        data: `Worker error: ${error.message}`
    });
};