const Product = require("../models/Product");
const slugify = require("slugify");

exports.getAllProducts = async (req, res) => {
  try {
    const { color, size } = req.query;

    const filters = {};

    if (color) {
      filters["variants.color"] = { $in: color.split(",") };
    }

    if (size) {
      filters["variants.size"] = { $in: size.split(",") };
    }

    const products = await Product.find(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json(product);
  } catch (error) {
    console.error("خطا در دریافت محصول بر اساس آیدی", error);
    res.status(500).json({ message: "خطا در دریافت محصول" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ categories: category });
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "خطا در دریافت محصولات بر اساس دسته‌بندی" });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: "محصول پیدا نشد" });
    }

    res.json(product);
  } catch (error) {
    console.error("خطا در دریافت محصول:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, variants, categories } = req.body;

    if (!name) {
      return res.status(400).json({ message: "نام محصول الزامی است" });
    }

    let slug = slugify(name, { lower: true, strict: true });

    let existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const newProduct = new Product({
      id: Date.now().toString(),
      name,
      slug,
      price,
      description,
      variants,
      categories,
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "محصول با موفقیت اضافه شد", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "خطا در افزودن محصول" });
  }
};

exports.addMultipleProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: "فرمت داده‌ها نادرست است" });
    }

    const productsWithSlug = await Promise.all(
      products.map(async (product) => {
        let slug = slugify(product.name, { lower: true, strict: true });

        let existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
          slug = `${slug}-${Date.now()}`;
        }

        return { ...product, slug };
      })
    );

    const addedProducts = await Product.insertMany(productsWithSlug);
    res.status(201).json({
      message: "محصولات با موفقیت اضافه شدند",
      products: addedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "خطا در افزودن محصولات" });
  }
};

exports.deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "تمام محصولات با موفقیت حذف شدند" });
  } catch (error) {
    res.status(500).json({ message: "خطا در حذف محصولات" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "عبارت جستجو وارد نشده است" });
    }

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
    });

    res.json(products);
  } catch (error) {
    console.error("خطا در جستجوی محصولات:", error);
    res.status(500).json({ message: "خطا در جستجو" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json({ message: "محصول با موفقیت ویرایش شد", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "خطا در ویرایش محصول" });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json({ message: "محصول با موفقیت حذف شد" });
  } catch (error) {
    res.status(500).json({ message: "خطا در حذف محصول" });
  }
};
