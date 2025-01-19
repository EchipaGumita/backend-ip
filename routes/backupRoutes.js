const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { spawn } = require('child_process');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Manual Backup
router.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.gz`;
  const backupPath = path.join(BACKUP_DIR, backupFile);

  // Modify the command to back up only the 'test' database
  const command = `mongodump --uri="${process.env.MONGO_URI}" --db=test --archive="${backupPath}" --gzip`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error.message);

      return res.status(500).json({ message: 'Backup failed', error: error.message });
    }
    console.log('Backup successful:', backupFile);
    res.json({ message: 'Backup successful', file: backupFile });
  });
});

// Restore Backup
router.post('/restore', (req, res) => {
  const { backupFile } = req.body;
  if (!backupFile) {
    return res.status(400).json({ message: 'Backup file name is required' });
  }

  const backupPath = path.join(BACKUP_DIR, backupFile);

  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ message: 'Backup file not found' });
  }

  const command = 'mongorestore';
  const args = [
    `--uri=${process.env.MONGO_URI}`,
    `--archive=${backupPath}`,
    '--gzip',
    '--drop',
    '--nsInclude=test.*', // Restore only the 'test' database
  ];

  const restoreProcess = spawn(command, args);

  restoreProcess.stdout.on('data', (data) => {
    console.log(`Restore stdout: ${data}`);
  });

  restoreProcess.stderr.on('data', (data) => {
    console.error(`Restore stderr: ${data}`);
  });

  restoreProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Restore successful:', backupFile);
      res.json({ message: 'Restore successful' });
    } else {
      console.error(`Restore process exited with code: ${code}`);
      res.status(500).json({ message: 'Restore failed', code });
    }
  });
});

// List Backups
router.get('/list', (req, res) => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err.message);
      return res.status(500).json({ message: 'Error reading backup directory', error: err.message });
    }

    const backups = files.filter((file) => file.endsWith('.gz'));
    res.json({ backups });
  });
});

module.exports = router;
