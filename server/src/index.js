const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs').promises;

const app = express();
const upload = multer({
  dest: '../uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  }
});

const PROJECT_PATH = '/pretrained/';

function evaluateImage(imagePath, threshold) {
  return new Promise((resolve, reject) => {
    console.log('deepdanbooru', ['evaluate', imagePath, '--project-path', PROJECT_PATH, '--threshold', threshold].join(' '));
    const deepdanbooruProcess = spawn('deepdanbooru', ['evaluate', imagePath, '--project-path', PROJECT_PATH, '--threshold', threshold]);
    
    let stdout = [];
    deepdanbooruProcess.stdout.on('data', (data) => {
      let dataStr = data.toString();
      if(dataStr.startsWith("("))
        stdout += dataStr;
    });

    deepdanbooruProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    deepdanbooruProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`DeepDanbooru process exited with code ${code}`));
      } else {
        resolve(stdout.trim().split('\n'));
      }
    });
  });
}

app.use(express.static('public'));
app.use(express.json());
app.use(helmet());
app.post('/evaluate', upload.single('image'), async (req, res) => {
  try {
    const image = req.file;
    const threshold = req.body.minConfidence;
    if(threshold < 0.35) {
      res.status(500).send('minConfidence is too low.');
      return;
    }
    const labels = await evaluateImage(image.path, threshold);
    const resData = labels.map((label) => {
      const regex = /\((\d+\.\d{3})\)\s+(.*)/;
      const match = label.match(regex);
      return {
        tag: match[2],
        confidence: parseFloat(match[1]).toFixed(3)
      }
    });
    resData.sort((a, b) => b.confidence - a.confidence);
    await fs.unlink(image.path);
    res.send(resData);
  } catch (error) {
    if(req.file?.path)
      await fs.unlink(req.file.path);
    console.error(error);
    res.status(500).send('An error occurred while evaluating the image.');
  }
});

app.listen(7500, () => {
  console.log('Server is running on port 7500');
});