const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to ensure directory exists
const ensureDirSync = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('UserID:', req.body.userId);
        console.log('ConversationID:', req.body.conversationId);
        const userId = req.body.userId;
        const conversationId = req.body.conversationId;
        if (!userId || !conversationId) {
            return cb(new Error("Missing user ID or conversation ID"), false);
        }

        const uploadPath = path.join('pdf-uploads', userId, conversationId);
        ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

exports.uploadFile = upload.single('file');

exports.handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({
        message: 'File uploaded successfully.',
        path: req.file.path,
        fileName: req.file.filename,
        conversationID: req.conversationId
    });
};