const express = require("express");
const router = express.Router();

// we get the model of Product from models -> index.js
const { Product, Category, Tag } = require("../models");

// import in the Forms
const { bootstrapField, createProductForm } = require("../forms");

async function allCategories() {
  return await Category.fetchAll().map((category) => {
    return [category.get("id"), category.get("name")];
  });
}

async function allTags() {
  return await Tag.fetchAll().map((category) => {
    return [category.get("id"), category.get("name")];
  });
}

// CRUD - READ
router.get("/", async (req, res) => {
  let products = await Product.collection().fetch({
    withRelated: ["category"],
  });
  res.render("products/index", {
    products: products.toJSON(),
  });
});

// CRUD - CREATE
router.get("/create", async (req, res) => {
  const productForm = createProductForm(await allCategories(), await allTags());
  res.render("products/create.hbs", {
    form: productForm.toHTML(bootstrapField),
  });
});
router.post("/create", async (req, res) => {
  const productForm = createProductForm(await allCategories(), await allTags());
  productForm.handle(req, {
    success: async (form) => {
      // console.log(form.data)
      let { tags, ...productData } = form.data;
      // console.log(productData)
      console.log(tags)
      const product = new Product(productData);
      console.log(product);
      await product.save();

      if (tags) {
        await product.tags().attach(tags.split(","));
      }
      console.log(product);

      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/create", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - UPDATE
router.get("/:product_id/update", async (req, res) => {
  // retrieve the product
  const productId = req.params.product_id;
  const product = await Product.where({
    id: parseInt(productId),
  }).fetch({
    require: true,
    withRelated: ["tags"],
  });

  const productForm = createProductForm(await allCategories(), await allTags());

  // fill in the existing values
  productForm.fields.name.value = product.get("name");
  productForm.fields.cost.value = product.get("cost");
  productForm.fields.description.value = product.get("description");
  productForm.fields.category_id.value = product.get("category_id");

  // fill in the multi-select for the tags
  let selectedTags = await product.related("tags").pluck("id");
  // console.log(selectedTags)
  productForm.fields.tags.value = selectedTags;

  res.render("products/update", {
    form: productForm.toHTML(bootstrapField),
    product: product.toJSON(),
  });
});

router.post("/:product_id/update", async (req, res) => {
  // fetch the product that we want to update
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    required: true,
    withRelated: ["tags"],
  });

  // process the form
  const productForm = createProductForm(await allCategories(), await allTags());
  productForm.handle(req, {
    success: async (form) => {
      let { tags, ...productData } = form.data;
      product.set(productData);
      product.save();
      // update the tags

      let tagIds = tags.split(",");
      let existingTagIds = await product.related("tags").pluck("id");
      // console.log(existingTagIds)

      // remove all the tags that aren't selected anymore
      let toRemove = existingTagIds.filter(
        (id) => tagIds.includes(id) === false
      );
      await product.tags().detach(toRemove);

      // add in all the tags selected in the form
      await product.tags().attach(tagIds);

      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/update", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - DELETE
router.get("/:product_id/delete", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });

  res.render("products/delete.hbs", {
    product: product.toJSON(),
  });
});
router.post("/:product_id/delete", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  await product.destroy();
  res.redirect("/products");
});

module.exports = router;
