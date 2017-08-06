var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon_db'
});

connection.connect(function(err) {
    if(err) throw err;
    start();
});

function start() {
    inquirer.prompt([
        {
            name: "action",
            type: "rawlist",
            message: "Which would you like to do?",
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(function(data) {
        //console.log(data);
        if(data.action === 'View Products for Sale'){
            viewProductsForSale(start);
        } else if(data.action === 'View Low Inventory') {
            viewLowInventory();
        } else if(data.action === 'Add to Inventory') {
            viewProductsForSale(() => addToInventory(updateDB));
        } else {
            addNewProduct();
        }
    })
}

function viewProductsForSale(callback) {
    var query = connection.query(
        'select * from products',
        function(err, res) {
            if(err) throw err;
            console.log('\n');
            for(var i = 0; i < res.length; i++){
                console.log('Id: ' + res[i].item_id + ' || ' + 'Name: ' + res[i].product_name  + ' || ' + 'Price: ' + res[i].price + ' || ' + 'Quantity: ' + res[i].stock_quantity);
            }
            console.log('\n');
            callback();
        }
    )
}


function viewLowInventory() {
    var query = connection.query(
        'select * from products where stock_quantity < 5',
        function(err, res) {
            if(err) throw err;
            console.log('\n');
            if(res.length === 0) {
                console.log('There is no low inventory!\n');
            }
            for(var i = 0; i < res.length; i++){
                console.log('Id: ' + res[i].item_id + ' || ' + 'Name: ' + res[i].product_name  + ' || ' + 'Price: ' + res[i].price + ' || ' + 'Quantity: ' + res[i].stock_quantity);
            }
            console.log('\n');
            start();
        }
    )
}


function addToInventory(callback) {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id of the product you would like to add to?"
        },
        {
            name: "number",
            type: "input",
            message: "How many units would you like to add?"
        }
    ]).then(function(data) {
        var quant = data.number;
        var query = connection.query(
            'select * from products where ?',
            {
                item_id: parseInt(data.id)
            },
            function(err, res) {
                var quant = parseInt(res[0].stock_quantity) + parseInt(data.number);
                callback(data.id, quant, res[0].product_name);
            });
    })  

}


function addNewProduct() {
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What is the name of the product you would like to add?"
        },
        {
            name: "dept",
            type: "input",
            message: "What department is it in?"
        },
        {
            name: "price",
            type: "input",
            message: "What is the price?"
        },
        {
            name: "quantity",
            type: "input",
            message: "How many units are there?"
        }
    ]).then(function(data) {
        var query = connection.query(
        'insert into products set ?',
        {
            product_name: data.name, 
            department_name: data.dept, 
            price: parseFloat(data.price), 
            stock_quantity: parseInt(data.quantity)
        },
        function(err, res) {
            console.log('\n' + data.name + ' has been added to your inventory!\n');
            start();
        })
    })
}

function updateDB(id, quant, name) {
    var query = connection.query(
        'update products set stock_quantity = ? where item_id = ?',
        [quant, id],
        function(err, res) {
            console.log('\nThe inventory for ' + name + ' is now ' + quant + '.\n');     
            start();
    })   
}
