const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary upload folder

app.post('/upload-audio', upload.single('audio'), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'recordings', `${Date.now()}-${req.file.originalname}`);

  // Move file to the desired location in the repo
  fs.rename(tempPath, targetPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving file.');
    }
    res.status(200).send('File uploaded successfully.');
  });
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
