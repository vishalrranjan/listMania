//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vishal:atlasDB113@cluster0.qv07y.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name: {
    type: String,
    required: [true, "Ahh! you forget to enter name."]
  },
}

const Items = mongoose.model("Item", itemSchema);

const item1 = new Items({
  name: "Buy Food"
});

const item2 = new Items({
  name: "Go to GYM"
});

const item3 = new Items({
  name: "Study for 3 hrs"
});

const defaultItem = [item1, item2, item3];

const listItemScehma = {
  name: String,
  items: [itemSchema],
}

const List = mongoose.model("List", listItemScehma);


// send get req
  app.get("/", function(req, res) {

    Items.find({}, function(err, items){
      if(items.length===0){
        Items.insertMany(defaultItem, function(err){
          if(err){
            console.log(err);
          } else{
            console.log("Items added successfully.");
          }
        });
        res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    });
  });
// 

// update item 
  app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Items({
      name: itemName
    })

    if(listName==="Today"){
      item.save();
      res.redirect("/");
    } else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }
  });
// 

// delete item

  app.post("/delete", function(req, res){
    const checkedItem = req.body.checkbox;
    Items.deleteOne({_id: checkedItem}, function(err){
      if(!err){
        console.log("successfully delete item.");
        res.redirect("/");
      }
    });
  });
// 

// dynamic route
  app.get("/:customListName", function(req,res){
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          // create new list
          const list = new List({
            name: customListName,
            items: defaultItem
          });
        
          list.save();
          res.redirect("/" + customListName);
        } else{
          // show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    })
  });
// 

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
