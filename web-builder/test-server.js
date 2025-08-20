const express = require('express');
const path = require('path');

const app = express();
const port = 3003;

// Serve static files
app.use(express.static('public'));

// Basic route to test server functionality
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>AI Marketing Web Builder - Server Test</title></head>
      <body>
        <h1>🚀 Server is Running!</h1>
        <p>The development environment is working correctly.</p>
        <p>Server time: ${new Date().toISOString()}</p>
        <p>Next step: Install Next.js dependencies properly</p>
      </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Test server running at http://0.0.0.0:${port}`);
  console.log(`🔧 Ready to install Next.js when dependencies are fixed`);
});