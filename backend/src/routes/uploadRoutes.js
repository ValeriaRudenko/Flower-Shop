import express from 'express';
import multer from 'multer';
import path from "path";
import {isAdmin, isAuth} from "../utils.js";
import Bouquet from "../models/bouquetModel.js";
import {Flower} from "../models/flowerModel.js";
import Packing from "../models/packingModel.js";


const uploadRouter = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({storage: storage});

uploadRouter.post('/',
    isAuth,
    isAdmin,
    upload.single('file'), async (req, res) => {
        try {
            // Check if file exists
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }

            // Get file information
            const {filename} = req.file;
            const {type, id} = req.body;

            // Construct the file URL
            const fileUrl = `/images/${filename}`;

            // Update image based on type and ID
            let updatedEntity;

            if (type === 'product') {
                // Update product image
                updatedEntity = await Bouquet.findByIdAndUpdate(id, {image: fileUrl}, {new: true});
            } else if (type === 'flower') {
                // Update flower image
                updatedEntity = await Flower.findByIdAndUpdate(id, {image: fileUrl}, {new: true});
            } else if (type === 'packing') {
                // Update package image
                updatedEntity = await Packing.findByIdAndUpdate(id, {image: fileUrl}, {new: true});
            } else {
                return res.status(400).send('Invalid type specified.');
            }

            if (!updatedEntity) {
                return res.status(404).send('Entity not found.');
            }

            // Send response with updated entity
            res.send(fileUrl);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    });


export default uploadRouter;
