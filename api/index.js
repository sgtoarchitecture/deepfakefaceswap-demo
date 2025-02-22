const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguráljuk a Multer-t, hogy memóriában tárolja a feltöltött fájlokat
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// JSON parsing middleware
app.use(express.json());

// Mock "adatbázis" a rendelési adatok tárolásához
let orders = {};

// Feltöltési végpont – Step 1
app.post('/api/upload', upload.fields([{ name: 'sourceImage' }, { name: 'targetImage' }]), (req, res) => {
  if (!req.files || !req.files['sourceImage'] || !req.files['targetImage']) {
    return res.status(400).json({ success: false, message: 'Mindkét kép szükséges.' });
  }
  
  // Konvertáljuk a képeket Base64 formátumba
  const sourceBase64 = req.files['sourceImage'][0].buffer.toString('base64');
  const targetBase64 = req.files['targetImage'][0].buffer.toString('base64');
  
  // Generáljunk egy egyszerű orderId-t
  const orderId = Date.now().toString();
  
  // Tároljuk az adatokat a mock "adatbázisban"
  orders[orderId] = {
    email: req.body.email,
    sourceImage: sourceBase64,
    targetImage: targetBase64,
    status: 'uploaded'
  };
  
  res.json({ success: true, orderId, message: 'Képek feltöltve. Tovább a fizetéshez.' });
});

// Fizetési végpont – Step 2 (mock fizetés)
app.post('/api/pay', (req, res) => {
  const { orderId } = req.body;
  if (!orders[orderId]) {
    return res.status(400).json({ success: false, message: 'Érvénytelen rendelés azonosító.' });
  }
  
  // Szimuláljuk a fizetést
  orders[orderId].status = 'paid';
  
  res.json({ success: true, message: 'Fizetés sikeres.' });
});

// (Opcionális) E-mail küldés funkció – itt hívhatod meg az AI feldolgozás után
function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Állítsd be Vercelben
      pass: process.env.EMAIL_PASS   // Állítsd be Vercelben
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email küldési hiba:', error);
    } else {
      console.log('Email elküldve:', info.response);
    }
  });
}

// Indítjuk a szervert
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
