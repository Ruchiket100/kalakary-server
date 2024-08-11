import { Request, Response, NextFunction } from 'express';
import { NewProductType, SearchRequestQuery } from '../types/types';
import { Product } from '../models/product';
import { uploadToCloudinary } from '../utils/utils';

export async function newProduct(
    req: Request,
    res: Response, next: NextFunction) {
    const { name, price, stock, category, description } = req.body as NewProductType;

    const photos = req.files as Express.Multer.File[] | undefined;


    if (!photos) return next(res.status(400).json({ message: "Please add Photo" }))

    if (photos.length < 1)
        return next(res.status(400).json({ message: "Please add Photo" }))

    if (photos.length > 5)
        return next(res.status(400).json({ message: "You can only upload 5 Photos" }))


    if (!name || !photos || !price || !stock || !category || !description) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    const photosURL = await uploadToCloudinary(photos);

    const product = await Product.create({
        name,
        price,
        description,
        stock,
        category: category.toLowerCase(),
        photos: photosURL,
    });

    return res.status(202).json(
        {
            success: true,
            message: "Product created successfully",
            data: product
        }
    )
}

export async function getProducts(req: Request<{}, {}, {}, SearchRequestQuery>, res) {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const key = `products-${search}-${sort}-${category}-${price}-${page}`;  

    const products = await Product.find();

    if (!products) return res.status(400).json({ message: "No products found" });

    return res.status(200).json({
        success: true,
        data: products
    })
}

export async function getProduct(req, res) {
    const id = req.params.id;
    const product = await Product.findById(id);

    return res.status(200).json({
        success: true,
        data: product
    });
}