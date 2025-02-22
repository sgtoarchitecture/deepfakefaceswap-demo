// deepfakefaceswap demo - basic version

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up memory storage for uploaded images (to avoid filesystem issues on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Homepage route to prevent 'Cannot GET /' error
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Deepfake Face Swap Demo</h1><p>Use the /upload endpoint to upload an image.</p>');
});

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
