const express = require("express");
const path = require("path");
const nano = require("nano")("http://localhost:5984");

const app = express();

app.set("view engine", "ejs");
app.set("Views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dwiDb = nano.db.use("dwi");

const getType = async () => {
  try {
    const body = await dwiDb.view(
      "products",
      "products-type?reduce=true&group_level=1"
    );
    const productType = body.rows;
    return productType;
  } catch (err) {
    console.log(err);
  }
};

app.get("/", async function (req, res) {
  try {
    const body = await dwiDb.view("products", "products-list");
    const productTypes = await getType();
    const products = body.rows;
    console.log("Product type ", productTypes);
    res.render("index", { products, productTypes });
  } catch (err) {
    console.log(err);
  }
});

app.post("/product/add", async (req, res) => {
  try {
    const id = await nano.uuids(1);
    const average = req.body.average;
    const count = req.body.count;
    const condition = req.body.condition;
    const category = req.body.category;
    const title = req.body.title;
    const type = req.body.type;
    const year = req.body.year;
    const price = req.body.price;
    const description = req.body.description;
    const stock = req.body.stock;

    const response = await dwiDb.insert({
      _id: id[0],
      title: title,
      stock: stock,
      condition: condition,
      category: category,
      year: year,
      type: type,
      reviews: { count: count, average: average },
      price: price,
      description: description,
    });

    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const rev = req.body.rev;
    const average = req.body.average;
    const count = req.body.count;
    const condition = req.body.condition;
    const category = req.body.category;
    const title = req.body.title;
    const type = req.body.type;
    const year = req.body.year;
    const price = req.body.price;
    const description = req.body.description;
    const stock = req.body.stock;

    const response = await dwiDb.insert({
      _id: id,
      _rev: rev,
      title: title,
      stock: stock,
      condition: condition,
      category: category,
      year: year,
      type: type,
      reviews: { count: count, average: average },
      price: price,
      description: description,
    });

    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const rev = req.body.rev;

  try {
    const response = await dwiDb.destroy(id, rev);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/updatepage/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await dwiDb.get(id);
    const product = response;
    res.render("updatepage", { product });
  } catch (err) {
    console.log(err);
  }
});

app.get("/addPage", (req, res) => {
  res.render("addpage");
});

app.listen(3000, function () {
  console.log("Server Started on Port 3000");
});
