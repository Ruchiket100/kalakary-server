import { Request, Response, NextFunction } from 'express';
import { BaseQuery, NewProductType, SearchRequestQuery } from '../types/types';
import { Product } from '../models/product';
import { uploadToCloudinary, deleteFromCloudinary, clearCache } from '../utils/utils';
import { redis } from '../app';

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

    let products;
    let totalPage;

    products = await Product.find();


    const cachedData = await redis.get(key);

    if (cachedData) {
        const data = JSON.parse(cachedData);
        totalPage = data.totalPage;
        products = data.products;
    } else {
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;
        const baseQuery: BaseQuery = {};


        if (search)
            baseQuery.name = {
                $regex: search,
                $options: "i",
            };

        if (price)
            baseQuery.price = {
                $lte: Number(price),
            };

        if (category) baseQuery.category = category;

        const productsPromise = Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);

        const [productsFetched, filteredOnlyProduct] = await Promise.all([
            productsPromise,
            Product.find(baseQuery),
        ]);
        products = productsFetched;
        totalPage = Math.ceil(filteredOnlyProduct.length / limit);

        await redis.setex(key, 30, JSON.stringify({ products, totalPage }));
    }

    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
}

export async function getProduct(req, res) {
    const id = req.params.id;
    const product = await Product.findById(id);

    return res.status(200).json({
        success: true,
        data: product
    });
}

export async function updateProduct(req, res, next) {
    const id = req.params.id;


    const { name, price, stock, category, description } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined;

    const product = await Product.findById(id);

    if (!product) return next(res.status(404).json({ message: "Product not found" }));

    if (photos && photos.length > 0) {
        const photosURL = await uploadToCloudinary(photos);

        const ids = product.photos.map((photo) => photo.public_id);

        await deleteFromCloudinary(ids);

        product.photos = photosURL as any;
    }


    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (description) product.description = description;

    await product.save();

    await clearCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
        data: product
    });
}

export const deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) return next(res.status(400).json({ message: "product not found" }));

    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);

    await product.deleteOne();

    await clearCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });

    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
}