
// deepfakefaceswap demo - basic version
const express = require('express');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Endpoint for file upload
app.post('/upload', upload.single('faceImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // Simulate AI processing (deepfake swap - placeholder)
    setTimeout(() => {
        const processedImagePath = `processed/${req.file.filename}`;
        fs.copyFile(req.file.path, processedImagePath, (err) => {
            if (err) {
                return res.status(500).send('Error processing image.');
            }
            
            // Simulate sending email with download link
            sendEmail(req.body.email, processedImagePath);
            res.json({ success: true, message: 'Processing complete. Check your email for download link.' });
        });
    }, 5000); // Simulated processing delay
});

// Function to send email
function sendEmail(to, filePath) {
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
        text: `Download your processed image here: ${filePath}`
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
