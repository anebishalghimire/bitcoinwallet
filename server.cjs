const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
const { generateWallet, validateAddress, checkBalance } = require('./lib/bitcoin-utils.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store for found wallets
let foundWallets = [];

// Load existing found wallets on startup
async function loadFoundWallets() {
  try {
    const data = await fs.readFile('found-wallets.json', 'utf8');
    foundWallets = JSON.parse(data);
    console.log(`Loaded ${foundWallets.length} previously found wallets`);
  } catch (error) {
    console.log('No existing found-wallets.json file, starting fresh');
    foundWallets = [];
  }
}

// Save found wallets to file
async function saveFoundWallets() {
  try {
    await fs.writeFile('found-wallets.json', JSON.stringify(foundWallets, null, 2));
    console.log('Found wallets saved to found-wallets.json');
  } catch (error) {
    console.error('Error saving found wallets:', error);
  }
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    foundWallets: foundWallets.length
  });
});

app.post('/api/scan-wallet', async (req, res) => {
  try {
    // Generate random wallet
    const wallet = generateWallet();
    
    // Check balance
    const balance = await checkBalance(wallet.address);
    
    // If wallet has balance, save it
    if (balance > 0) {
      const foundWallet = {
        ...wallet,
        balance,
        foundAt: new Date().toISOString()
      };
      
      foundWallets.push(foundWallet);
      await saveFoundWallets();
      
      console.log(`🎉 FOUND WALLET WITH BALANCE: ${wallet.address} - ${balance} BTC`);
    }
    
    res.json({
      address: wallet.address,
      balance,
      hasBalance: balance > 0
    });
    
  } catch (error) {
    console.error('Error in scan-wallet:', error);
    res.status(500).json({ 
      error: 'Failed to scan wallet',
      message: error.message 
    });
  }
});

app.post('/api/generate-wallet', (req, res) => {
  try {
    const wallet = generateWallet();
    res.json(wallet);
  } catch (error) {
    console.error('Error generating wallet:', error);
    res.status(500).json({ 
      error: 'Failed to generate wallet',
      message: error.message 
    });
  }
});

app.get('/api/validate/:address', (req, res) => {
  try {
    const { address } = req.params;
    const isValid = validateAddress(address);
    
    res.json({
      address,
      isValid,
      format: isValid ? 'Valid Bitcoin address' : 'Invalid format'
    });
    
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({ 
      error: 'Failed to validate address',
      message: error.message 
    });
  }
});

app.get('/api/found-wallets', (req, res) => {
  res.json({
    wallets: foundWallets,
    count: foundWallets.length,
    totalBalance: foundWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  });
});

// Educational endpoints
app.post('/api/analyze-key', (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey || !/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      return res.status(400).json({ 
        error: 'Invalid private key format. Must be 64 hexadecimal characters.' 
      });
    }
    
    const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    
    // Generate different address formats
    const addresses = generateAddressVariations(privateKey);
    
    res.json({
      privateKey,
      publicKey: keyPair.publicKey.toString('hex'),
      wif: keyPair.toWIF(),
      addresses
    });
    
  } catch (error) {
    console.error('Error analyzing private key:', error);
    res.status(500).json({ 
      error: 'Failed to analyze private key',
      message: error.message 
    });
  }
});

app.post('/api/address-variations', (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey || !/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      return res.status(400).json({ 
        error: 'Invalid private key format' 
      });
    }
    
    const variations = generateAddressVariations(privateKey);
    res.json(variations);
    
  } catch (error) {
    console.error('Error generating address variations:', error);
    res.status(500).json({ 
      error: 'Failed to generate address variations',
      message: error.message 
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startServer() {
  await loadFoundWallets();
  
  app.listen(PORT, () => {
    console.log(`🚀 Bitcoin Wallet Scanner running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔍 API Status: http://localhost:${PORT}/api/status`);
  });
}

startServer().catch(console.error);