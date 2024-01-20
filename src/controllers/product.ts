import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
// import {faker} from '@faker-js/faker'




export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {

    const { name, price, stock, category } = req.body;

    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please Add Photo", 400))
    if (!name || !price || !stock || !category) {
        rm(photo.path, () => {
            console.log("deleted");

        })
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo.path,
    });
    return res.status(201).json({
        success: true,
        message: "Product created successfully"
    })
}
)

export const getlatestProducts = TryCatch(
    async (req, res, next) => {
        let products;

        if (myCache.has("latest-products"))
          products = JSON.parse(myCache.get("latest-products") as string);
        else {
          products = await Product.find({}).sort({ createdAt: -1 }).limit(6);
          myCache.set("latest-products", JSON.stringify(products));
        }
        return res.status(200).json({
            success: true,
            products,
        });
    });

export const getAllCategories = TryCatch(
    async (req, res, next) => {

        let categories;

        if (myCache.has("categories"))
          categories = JSON.parse(myCache.get("categories") as string);
        else {
          categories = await Product.distinct("category");
          myCache.set("categories", JSON.stringify(categories));
        }

        return res.status(200).json({
            success: true,
            categories,
        });
    });

export const getAdminProducts = TryCatch(
    async (req, res, next) => {

        const products = await Product.find({});
        return res.status(200).json({
            success: true,
            products,
        });
    });




export const getSingleProduct = TryCatch(
    async (req, res, next) => {

        const product = await Product.findById(req.params.id);
        if (!product) return next(new ErrorHandler("Product Not Found", 404));
        return res.status(200).json({
            success: true,
            product,
        });
    });


export const updateProduct = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const { name, price, stock, category } = req.body;
        const photo = req.file;
        const product = await Product.findById(id);
        if (!product) return next(new ErrorHandler("Invalid Product Id", 404));
        
        if (photo) {
            rm(product.photo!, () => {
                console.log("old photo deleted");

            });
            product.photo = photo.path;
        }
        if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
        
  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
    });
    



export const deleteProduct = TryCatch(
    async (req, res, next) => {

        const product = await Product.findById(req.params.id);
        if (!product) return next(new ErrorHandler("Product not found", 404));
       
            rm(product.photo!, () => {
                console.log("product photo deleted");

            });
  

        await product.deleteOne();
        
        return res.status(200).json({
            success: true,
            message: "Product Deleted Successfully",
        });
    });

export const getAllProducts = TryCatch(
    async (req:Request<{},{},{},SearchRequestQuery>, res, next) => {

        const {search,sort,category,price} = req.query;

        const page = Number(req.query.page) || 1;

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
    
        const [products, filteredOnlyProduct] = await Promise.all([
          productsPromise,
          Product.find(baseQuery),
        ]);
       const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
    });


    //To create multiple products as faked
//     const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\c6ca60fc-8051-4cbf-8394-4c061332d73f.png",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

//generateRandomProducts()
// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };

