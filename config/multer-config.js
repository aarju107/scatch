const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024, // 4 MB — images are stored inline in the document
    },
    fileFilter: (req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

module.exports = upload;