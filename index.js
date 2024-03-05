const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const app = express();

// Define a route for IP address
app.get('/', (req, res) => {
    res.send('Welcome to our website!');
});

// Define a route for the specific file
app.get('/.well-known/pki-validation/9EA8588D37A8F31F2B37C2FBD93E15BD.txt', (req, res) => {
    // Construct the full path to the file
    const filePath = path.join('/home/ubuntu/nodejs-on-ec2/cert', '9EA8588D37A8F31F2B37C2FBD93E15BD.txt');
    
    // Read the data file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data file');
        }
        // Send the data to the client
        res.send(data);
    });
});

const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Load SSL certificate and key files
const privateKey = fs.readFileSync('/home/ubuntu/nodejs-on-ec2/cert/private.key', 'utf8');
const certificate = fs.readFileSync('/home/ubuntu/nodejs-on-ec2/cert/certificate.crt', 'utf8');
const caBundle = fs.readFileSync('/home/ubuntu/nodejs-on-ec2/cert/ca_bundle.crt', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: caBundle
};

// Start the HTTP server to redirect to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});
const httpServer = http.createServer(httpApp);
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});

// Start the HTTPS server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});
