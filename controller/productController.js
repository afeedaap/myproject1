const Product = require("../model/productModel")
const Category = require('../model/categoryModel')

// const sharp = require('sharp')
const fs = require('fs')
const category = require("../model/categoryModel")
const { trusted } = require("mongoose")



const productLoad = async (req, res) => {
  try {

    const productData = await Product.find().populate("category")
    const categoryData = await Category.find()
    res.render('products', {
      productData,
      categoryData
    })
  } catch (e) {
    console.log(e,"error in product load");
  }
}

const addProductLoad = async (req, res) => {
  try {
    const categoryData = await Category.find()
  
    res.render("addProducts", { categoryData })
  } catch (error) {
    console.log(error);
  }

}


// const addProduct = async (req, res) => {
//   try {

//     const categoryName = req.body.category
//     console.log(categoryName);
//     const category = await Category.findOne({ _id: categoryName })
//     console.log("category is ",category);
//     const files = req.files;
//     console.log("her req files",req.files);
//     const img = [
//       files.imageFile1[0].filename,
//       files.imageFile2[0].filename,
//       files.imageFile3[0].filename,
//       files.imageFile4[0].filename
//   ];

//  const resizedImages = await Promise.all(img.map(async(imageName) => {
//   const resizedImage = await sharp('C:/aspens/public/images/product/original/'+imageName)
//   .resize({width:400,height:500})
//   .toBuffer()
//   return {imageName,resizedImage}
//  }))
 
//  const productImages = {}

//  resizedImages.forEach((image) => {
//   productImages[`images.${image.imageName}`] = image.ImageName
//   fs.writeFile('C:/aspens/public/images/product/sized/'+image.imageName,image.resizedImage,(e) => {
//     if(e){
//       console.log("error while adding image:",e);
//     }else{
//       console.log('resized image is saved:',image.imageName);
//     }
//   })
//  })

   

//     

const addProduct = async (req, res) => {
  try {
    const categoryName = req.body.category;
    const category = await Category.findOne({ _id: categoryName });

    // Check if req.files is defined and not empty
    const files = req.files || {};

    // Check if imageFile1, imageFile2, etc. exist in files object
    const img = [
      files.imageFile1 ? files.imageFile1[0].filename : null,
      files.imageFile2 ? files.imageFile2[0].filename : null,
      files.imageFile3 ? files.imageFile3[0].filename : null,
      files.imageFile4 ? files.imageFile4[0].filename : null
    ];

    // Handle the case when img array is empty
    if (img.some(filename => filename === null)) {
      throw new Error('No image files uploaded');
    }

    // Create the product instance
    const product = new Product({
      name: req.body.name,
      category: category.id,
      quantity: req.body.quantity,
      price: req.body.price,
      "images.image1": files.imageFile1[0].filename,
      "images.image2": files.imageFile2[0].filename,
      "images.image3": files.imageFile3[0].filename,
      "images.image4": files.imageFile4[0].filename,
      description: req.body.description,
      size: req.body.size,
      offer: req.body.offer,
      Is_blocked: true
    });

    // Validate the product
    const validationError = product.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ error: 'Validation error', details: validationError.errors });
    }

    // Save the product to the database
    const productData = await product.save();
    
    // Send success response
    res.json({ success: true });
  } catch (e) {
    console.error('Error while adding product:', e);
    res.status(500).render('500');
  }
};

const editProductLoad = async (req, res) => {
  try {
   const id = req.query._id
    const productData = await Product.findOne({ _id: id }).populate("category")
    

    const categoryData = await Category.find({ is_block: true })

    res.render("editProduct", { productData, categoryData })
  } catch (error) {
    console.log(error);
  }
}

const editProduct = async (req, res) => {
  try {
    const _id = req.query._id
   
    const imagesFiles = await req.files
    const productData = await Product.findOne({ _id: _id })
    const categoryData = await Category.findOne({ _id: req.body.category[0] })
    
    const img = [
      imagesFiles.image1 ? imagesFiles.image1[0].filename : productData.images.image1,
      imagesFiles.image2 ? imagesFiles.image2[0].filename : productData.images.image2,
      imagesFiles.image3 ? imagesFiles.image3[0].filename : productData.images.image3,
      imagesFiles.image4 ? imagesFiles.image4[0].filename : productData.images.image4,
    ];


    for (let i = 0; i < img.length; i++) {
      await sharp('C:/aspens/public/images/product/original/' + img[i])
      .resize({ width: 450, height: 500 })
      .toFile('C:/aspens/public/images/product/sized/' + img[i])
    }

    await Product.findByIdAndUpdate(
      { _id: _id },
      {
        $set: {
          name: req.body.name,
          category: categoryData._id,
          quantity: req.body.quantity,
          price: req.body.price,
          "images.image1": img[0],
          "images.image2": img[1],
          "images.image3": img[2],
          "images.image4": img[3],
          description: req.body.discription,
          size:req.body.size,
          offer:req.body.offer

        }
      }
    )
    

    res.redirect('/admin/product')

  } catch (error) {
    console.log(error);
  }
}


const blockProduct = async(req,res)=>{
  try {

    const  product_id =  req.query._id
    const productData = await Product.findOne({_id:product_id})
    
    if(productData.Is_blocked==true){
      console.log('true');
     await Product.findByIdAndUpdate({_id:product_id},{$set:{Is_blocked:false}}) 
    }else{ 
      console.log('false'); 
      await Product.findByIdAndUpdate({_id:product_id},{$set:{Is_blocked:true}})
    }

    res.redirect('/admin/product')

  } catch (error) {
      console.log(error.message);
      res.render('500')
  }
}

const deleteProduct = async (req,res) => {
  try {
    const  product_id =  req.query._id
    const productData =await Product.findOne({_id:product_id})
if(productData.images){
  const imageValues = Object.values(productData.images)
 
    imageValues.forEach( value => {
      const imagePathOriginal = `public/images/product/original/${value}`
      const imagePathSized = `public/images/product/sized/${value}`

      try {
        fs.unlinkSync(imagePathOriginal)
        fs.unlinkSync(imagePathSized)
      } catch (e) {
        console.log("error to delete images",e);
      }
    } )
}


await Product.findByIdAndDelete({_id:product_id})
res.redirect('/admin/product')


  } catch (e) {
    console.log(e,"product deleting have an error occured")
  }
}





module.exports = {
  productLoad,
  addProductLoad,
  blockProduct,
  deleteProduct,
  addProduct,
  editProductLoad,
  editProduct,
}