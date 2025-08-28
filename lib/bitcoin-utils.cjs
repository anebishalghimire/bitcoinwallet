const bitcoin = require('bitcoinjs-lib');
const { randomBytes } = require('crypto');
const axios = require('axios');

// Generate a random Bitcoin wallet
function generateWallet() {
  try {
    // Generate random 32-byte private key
    const privateKey = randomBytes(32);
    
    // Create key pair
    const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey);
    
    // Generate different address formats
    const { address: p2pkhAddress } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey 
    });
    
    const { address: bech32Address } = bitcoin.payments.p2wpkh({ 
      pubkey: keyPair.publicKey 
    });
    
    return {
      privateKey: privateKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
      address: p2pkhAddress, // Use P2PKH as primary
      bech32Address,
      wif: keyPair.toWIF()
    };
    
  } catch (error) {
    throw new Error(`Failed to generate wallet: ${error.message}`);
  }
}

// Validate Bitcoin address format
function validateAddress(address) {
  try {
    // Try to decode as P2PKH
    try {
      bitcoin.address.toOutputScript(address);
      return true;
    } catch (e) {
      // Try Bech32
      try {
        bitcoin.address.toBech32(address);
        return true;
      } catch (e2) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
}

// Check Bitcoin balance using Blockstream API
async function checkBalance(address) {
  try {
    const response = await axios.get(`https://blockstream.info/api/address/${address}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Bitcoin-Wallet-Scanner/1.0'
      }
    });
    
    const data = response.data;
    
    // Return balance in BTC (satoshis / 100000000)
    const balanceInSatoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    return balanceInSatoshis / 100000000;
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Address not found means 0 balance
      return 0;
    }
    
    // For other errors, try backup API
    try {
      return await checkBalanceBackup(address);
    } catch (backupError) {
      console.error(`Balance check failed for ${address}:`, error.message);
      throw new Error(`Failed to check balance: ${error.message}`);
    }
  }
}

// Backup balance check using BlockCypher API
async function checkBalanceBackup(address) {
  try {
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Bitcoin-Wallet-Scanner/1.0'
      }
    });
    
    const data = response.data;
    return data.balance / 100000000; // Convert satoshis to BTC
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return 0;
    }
    throw error;
  }
}

// Generate multiple addresses from one private key
function generateAddressVariations(privateKey) {
  try {
    const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    
    const variations = {};
    
    // P2PKH (Legacy)
    const p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    if (p2pkh.address) variations.p2pkh = p2pkh.address;
    
    // P2WPKH (Bech32)
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
    if (p2wpkh.address) variations.p2wpkh = p2wpkh.address;
    
    // P2SH-P2WPKH (Wrapped SegWit)
    const p2sh = bitcoin.payments.p2sh({ 
      redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey })
    });
    if (p2sh.address) variations.p2sh = p2sh.address;
    
    return variations;
    
  } catch (error) {
    throw new Error(`Failed to generate address variations: ${error.message}`);
  }
}

module.exports = {
  generateWallet,
  validateAddress,
  checkBalance,
  generateAddressVariations
};