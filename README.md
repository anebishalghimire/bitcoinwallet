₿ Bitcoin Wallet Scanner (Educational Tool)

This project is a Bitcoin Wallet Scanner System created purely for educational and demonstration purposes. It helps learners explore Bitcoin wallet generation, address formats, and basic blockchain interactions in a safe, simulated environment.

⚠️ Disclaimer:

This tool does not discover real Bitcoin wallets.

The scanning feature is a simulation only, designed to illustrate concepts.

It is mathematically impossible to brute-force private keys of existing wallets with any practical computing power.

Never share private keys generated with this or any tool.

✨ Features

Real-Time Scanning Simulation

Start/stop scanning.

Adjustable number of simulated workers (via Web Workers).

Live stats: attempts, simulated “hits,” and BTC “found.”

Displays randomly generated example wallets with balance.

Secure Wallet Generation

Instantly create wallets with private key (Hex/WIF), public key, and address formats (Legacy, Bech32, etc.).

Educational breakdown of wallet components.

Educational Tools

Address Validator – check P2PKH, Bech32, etc. formats.

Private Key Analyzer – derive public key + addresses.

Address Converter – show Legacy/SegWit/Wrapped SegWit formats.

Persistent Storage – saves simulated “found” wallets to found-wallets.json.

Clean UI – dark theme dashboard with live status indicators and animations.

🚀 Tech Stack

Backend

Node.js (CommonJS), Express.js

bitcoinjs-lib, @noble/secp256k1, axios (blockchain API calls)

Frontend

HTML5, CSS3, Vanilla JavaScript

Web Workers for scanning simulation

📦 Project Structure
.
├── lib/
│   └── bitcoin-utils.cjs        # Helper functions
├── public/
│   ├── app.js                   # Frontend logic
│   ├── index.html                # Main UI
│   ├── style.css                 # Styling
│   └── worker.js                 # Web Worker for scanning
├── server.cjs                    # Express.js entry point
├── package.json                  # Dependencies
└── README.md                     # This file

⚙️ Setup

Clone the repository:

git clone <your-repository-url>
cd bitcoin-wallet-scanner


Install dependencies:

npm install


Start the server:

npm start
# or
npm run dev


App runs at http://localhost:3000

💡 Usage

Start/Stop Scanning – control the simulation process.

Generate Wallet – instantly view wallet details.

Clear Stats – reset simulation.

Educational Tools – validate addresses, analyze private keys, explore formats.

🤝 Contributing

Contributions are welcome—feel free to open issues or submit PRs.

📄 License

❌ This project is provided without a license.
That means it is all rights reserved.
You may view the code but may not copy, modify, or redistribute it.
