const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const { port, dbUser, dbPassword, dbName } = require(__dirname + "/config");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect(
  "mongodb+srv://" +
    dbUser +
    ":" +
    dbPassword +
    "@cluster0.x41xkhr.mongodb.net/" +
    dbName
);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todo list",
});

const item2 = new Item({
  name: "Hot the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find({})
    .then(function (items) {
      if (items.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: items });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:listName", (req, res) => {
  const listName = _.capitalize(req.params.listName);

  async function showList() {
    const result = await List.findOne({ name: listName }).exec();
    if (result) {
      res.render("list", { listTitle: listName, newListItems: result.items });
    } else {
      const list = new List({
        name: listName,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + listName);
    }
  }

  showList();
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    addItem();
  }

  async function addItem() {
    const result = await List.findOne({ name: listName }).exec();
    if (result) {
      result.items.push(item);
      result.save();
      res.redirect("/" + listName);
    }
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    deleteItem();
    res.redirect("/");
  } else {
    deleteItemFromSpecifiedList();
  }

  async function deleteItem() {
    await Item.deleteOne({ _id: checkedItemId });
  }

  async function deleteItemFromSpecifiedList() {
    const result = await List.updateOne(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    );
    if (result) {
      res.redirect("/" + listName);
    }
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(port || 3000, () => {
  console.log("Server is running");
});
