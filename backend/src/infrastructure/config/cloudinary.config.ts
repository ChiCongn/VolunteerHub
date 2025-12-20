import multer from "multer";
import path from "path";
import fs from "fs";

type UploadFolder = "avatars" | "events" | "posts";

export const uploadLocal = (folder: UploadFolder) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // Path: uploads/avatars, uploads/events, ...
            const uploadPath = path.join("uploads", folder);

            // Create the folder if it doesn't exist
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            // Generate unique filename: timestamp-random-originalname
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
        },
    });

    // Check file type (equivalent to allowed_formats in Cloudinary)
    const fileFilter = (req: any, file: any, cb: any) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only .png, .jpg and .jpeg formats are allowed!"), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    });
};
