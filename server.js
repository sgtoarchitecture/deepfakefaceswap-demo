// deepfakefaceswap demo - basic version

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up memory storage for uploaded images (to avoid filesystem issues on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Homepage route with an actual HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle missing favicon request to avoid 404 errors
app.get('/favicon.ico', (req, res) => res.status(204));

// Endpoint for file upload
app.post('/upload', upload.single('faceImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // Convert file to Base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // Simulate sending email with download link
    sendEmail(req.body.email, dataUrl);
    res.json({ success: true, message: 'Processing complete. Check your email for download link.', imageUrl: dataUrl });
});

// Function to send email
function sendEmail(to, imageUrl) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Your Deepfake Image is Ready!',
        text: `Download your processed image here: ${imageUrl}`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
