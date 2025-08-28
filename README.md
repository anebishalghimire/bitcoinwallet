# ₿ Bitcoin Wallet Scanner (Educational Tool)

A comprehensive **Bitcoin Wallet Scanner System** designed as an educational and demonstration tool for exploring Bitcoin cryptography, wallet generation, address formats, and blockchain interactions in a safe, controlled environment.

![Bitcoin](https://img.shields.io/badge/Bitcoin-Educational-orange?style=for-the-badge&logo=bitcoin)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ⚠️ Important Disclaimer

**This tool is for educational purposes only and does not discover real Bitcoin wallets.**

- The scanning feature is a **simulation only**, designed to illustrate Bitcoin cryptographic concepts
- It is **mathematically impossible** to brute-force private keys of existing wallets with any practical computing power
- **Never share private keys** generated with this or any tool
- This project demonstrates Bitcoin technology for learning purposes

## ✨ Features

### 🔍 Real-Time Scanning Simulation
- **Start/Stop Scanning**: Control the wallet generation simulation
- **Multi-Worker Support**: Adjustable number of Web Workers (1-8 workers)
- **Live Statistics**: Real-time tracking of attempts, simulated "hits," and BTC "found"
- **Activity Logging**: Detailed log of all scanning activities
- **Progress Visualization**: Animated progress bars and status indicators

### 🔑 Secure Wallet Generation
- **Instant Wallet Creation**: Generate complete Bitcoin wallets with all components
- **Multiple Address Formats**: P2PKH (Legacy), P2WPKH (Bech32), P2SH-P2WPKH (Wrapped SegWit)
- **Complete Key Information**: Private key (Hex/WIF), public key, and derived addresses
- **Educational Breakdown**: Clear explanation of each wallet component

### 🎓 Educational Tools
- **Address Validator**: Verify Bitcoin address formats (P2PKH, Bech32, etc.)
- **Private Key Analyzer**: Derive public keys and addresses from private keys
- **Address Format Converter**: Demonstrate how one private key creates multiple address types
- **Cryptographic Demonstrations**: Visual examples of Bitcoin's cryptographic relationships

### 💾 Data Management
- **Persistent Storage**: Automatically saves simulated "found" wallets to `found-wallets.json`
- **Statistics Tracking**: Comprehensive scanning statistics and performance metrics
- **Export Capabilities**: Easy access to generated wallet data

### 🎨 User Interface
- **Modern Dark Theme**: Professional, easy-on-the-eyes interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live status indicators and animated feedback
- **Intuitive Controls**: User-friendly dashboard with clear navigation

## 🚀 Technology Stack

### Backend
- **Node.js** (CommonJS) - Server runtime
- **Express.js** - Web framework and API server
- **bitcoinjs-lib** - Bitcoin cryptographic operations
- **@noble/secp256k1** - Elliptic curve cryptography
- **axios** - HTTP client for blockchain API calls
- **cors** - Cross-origin resource sharing

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Advanced styling with animations and responsive design
- **Vanilla JavaScript** - Pure JavaScript for optimal performance
- **Web Workers** - Multi-threaded scanning simulation

### APIs
- **Blockstream.info API** - Primary blockchain data source
- **BlockCypher API** - Backup blockchain data provider

## 📁 Project Structure

```
bitcoin-wallet-scanner/
├── lib/
│   └── bitcoin-utils.cjs        # Bitcoin utility functions
├── public/
│   ├── app.js                   # Main frontend application
│   ├── index.html               # HTML interface
│   ├── style.css                # Styling and animations
│   └── worker.js                # Web Worker for scanning
├── server.cjs                   # Express.js server
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lock file
└── README.md                    # This documentation
```

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (version 16.0.0 or higher)
- **npm** (comes with Node.js)
- Modern web browser with Web Worker support

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bitcoin-wallet-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   
   For development:
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 💡 Usage Guide

### Getting Started
1. **Check Server Status**: Ensure the green status indicator shows "Server Online"
2. **Configure Workers**: Select the number of scanning workers (1-8)
3. **Start Scanning**: Click "Start Scanning" to begin the simulation

### Main Features

#### Wallet Scanning Simulation
- **Start/Stop**: Control the scanning process with intuitive buttons
- **Worker Configuration**: Adjust parallel processing simulation
- **Live Monitoring**: Watch real-time statistics and progress
- **Found Wallets**: View any wallets discovered with non-zero balances

#### Wallet Generation
- **Generate New Wallet**: Create a complete Bitcoin wallet instantly
- **View Details**: Examine all cryptographic components
- **Security Warnings**: Built-in reminders about private key security

#### Educational Tools
- **Address Validation**: Test Bitcoin address formats
- **Key Analysis**: Explore private key to address relationships
- **Format Conversion**: See how different address types are derived

### API Endpoints

The application provides several educational API endpoints:

- `GET /api/status` - Server status and statistics
- `POST /api/scan-wallet` - Generate and check a random wallet
- `POST /api/generate-wallet` - Create a new wallet
- `GET /api/validate/:address` - Validate Bitcoin address format
- `GET /api/found-wallets` - Retrieve found wallets
- `POST /api/analyze-key` - Analyze private key components

## 🔧 Configuration

### Environment Variables
The application uses default settings but can be configured via environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Worker Configuration
Adjust scanning performance by modifying worker count in the interface:
- **1 Worker**: Basic simulation
- **2-4 Workers**: Moderate simulation
- **6-8 Workers**: Intensive simulation

## 🧪 Educational Value

This project demonstrates:

### Bitcoin Cryptography
- **Private Key Generation**: Secure random number generation
- **Public Key Derivation**: Elliptic curve cryptography (secp256k1)
- **Address Creation**: Hash functions and encoding schemes
- **Digital Signatures**: ECDSA signature verification

### Blockchain Concepts
- **Address Formats**: Evolution from P2PKH to Bech32
- **SegWit Technology**: Witness segregation and efficiency
- **Network Interaction**: Real blockchain API integration
- **Balance Verification**: UTXO model understanding

### Software Development
- **Asynchronous Programming**: Web Workers and Promise handling
- **API Design**: RESTful service architecture
- **Error Handling**: Robust error management and user feedback
- **Security Practices**: Safe handling of cryptographic material

## 🤝 Contributing

Contributions are welcome! This project aims to be an educational resource for the Bitcoin community.

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Maintain educational focus
- Include clear documentation
- Follow existing code style
- Add appropriate error handling
- Test thoroughly before submitting

## 📊 Performance Notes

### Scanning Simulation
- **Rate Limiting**: Built-in delays prevent API overwhelming
- **Error Handling**: Graceful degradation on API failures
- **Memory Management**: Efficient worker lifecycle management
- **Network Optimization**: Intelligent API failover system

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+
- **Web Workers**: Required for scanning simulation
- **Local Storage**: Used for persistent data
- **Responsive Design**: Mobile and desktop optimized

## 🔒 Security Considerations

### Private Key Handling
- **Never Log Private Keys**: No sensitive data in console/logs
- **Secure Generation**: Cryptographically secure random generation
- **User Education**: Clear warnings about key security
- **No Network Transmission**: Private keys stay client-side when possible

### API Security
- **Rate Limiting**: Prevents API abuse
- **Error Sanitization**: No sensitive data in error messages
- **CORS Configuration**: Proper cross-origin handling
- **Input Validation**: All user inputs validated

## 📈 Future Enhancements

Potential educational improvements:
- **Multi-signature Wallets**: Demonstrate advanced Bitcoin scripts
- **Lightning Network**: Show Layer 2 concepts
- **Hardware Wallet Integration**: Educational hardware wallet simulation
- **Transaction Building**: Interactive transaction creation
- **Script Analysis**: Bitcoin Script educational tools

## 🐛 Troubleshooting

### Common Issues

**Server Won't Start**
- Check Node.js version (16.0.0+)
- Verify port 3000 is available
- Run `npm install` to ensure dependencies

**Scanning Not Working**
- Check browser Web Worker support
- Verify internet connection for API calls
- Check browser console for errors

**API Errors**
- Blockchain APIs may have rate limits
- Check network connectivity
- Server automatically retries with backup APIs

## 📞 Support

For questions, issues, or educational discussions:
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Refer to inline code comments
- **Community**: Share educational use cases and improvements

## 🙏 Acknowledgments

- **Bitcoin Core Developers**: For the foundational Bitcoin protocol
- **bitcoinjs-lib Contributors**: For excellent JavaScript Bitcoin library
- **Blockstream**: For providing free blockchain API access
- **Noble Cryptography**: For high-quality cryptographic primitives
- **Educational Community**: For feedback and suggestions

---

**⚠️ Remember: This is an educational tool. Never use it to attempt unauthorized access to Bitcoin wallets. Always practice responsible cryptocurrency education and development.**