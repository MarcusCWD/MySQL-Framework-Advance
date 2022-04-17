const express = require("express");
const router = express.Router();

// we get the model of Product from models -> index.js
const { Product } = require("../models");

// import in the Forms
const { bootstrapField, createProductForm } = require("../forms");
const async = require("hbs/lib/async");
const { createPoolCluster } = require("mysql");

// CRUD - READ
router.get("/", async (req, res) => {
  let products = await Product.collection().fetch();
  res.render("products/index.hbs", {
    products: products.toJSON(),
  });
});

// CRUD - CREATE
router.get("/create", async (req, res) => {
  const productForm = createProductForm();
  res.render("products/create.hbs", {
    form: productForm.toHTML(bootstrapField),
  });
});
router.post("/create", async (req, res) => {
  console.log("post /create");
  const productForm = createProductForm();
  productForm.handle(req, {
    success: async (form) => {
      const product = new Product(form.data);
      await product.save();
      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/create.hbs", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - UPDATE
router.get("/:product_id/update", async (req, res) => {
  const productId = req.params.product_id;
  const product = await Product.where({
    id: productId,
  }).fetch({
    require: true,
  });

  const productForm = createProductForm();

  productForm.fields.name.value = product.get("name");
  productForm.fields.cost.value = product.get("cost");
  productForm.fields.description.value = product.get("description");

  res.render("products/update.hbs", {
    form: productForm.toHTML(bootstrapField),
    product: product.toJSON(),
  });
});
router.post("/:product_id/update", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  const productForm = createProductForm();
  productForm.handle(req, {
    success: async (form) => {
      product.set(form.data);
      product.save();
      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/update.hbs", {
        form: form.toHTML(bootstrapField),
        product: product.toJSON(),
      });
    },
  });
});

// CRUD - DELETE
router.get("/:product_id/delete", async (req, res) => {
  // fetch the product that we want to delete
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
  // fetch the product that we want to delete
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  await product.destroy();
  res.redirect("/products");
});

module.exports = router;
