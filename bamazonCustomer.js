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
    getAllProducts(askQuestions);
});


function getAllProducts(callback) {
    var query = connection.query(
        'select * from products',
        function(err, res) {
            if(err) throw err;
            console.log('\n');
            for(var i = 0; i < res.length; i++){
                console.log('Id: ' + res[i].item_id + ' || ' + 'Name: ' + res[i].product_name  + ' || ' + 'Price: ' + res[i].price);
            }
            console.log('\n');
            callback();
        }
    )
}

function askQuestions() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id of the product you would like to buy?"
        },
        {
            name: "number",
            type: "input",
            message: "How many units would you like to buy?"
        }
    ]).then(function(data) {
        var query = connection.query(
        'select * from products where ?',
        {
            item_id: parseInt(data.id)
        },
        function(err, res) {
            console.log(res[0].stock_quantity);
            if(res[0].stock_quantity < data.number) {
                console.log('\n============================');
                console.log('   Insufficient quantity!');
                console.log('============================\n');
                restart();
            } else {
                updateDB(data.id, res[0].stock_quantity, data.number, res[0].price, getTotal);
            }
        })
    })
}

function restart() {
    inquirer.prompt([
        {
            name: "restart",
            type: "confirm",
            message: "Would you like to place a new order?",
            default: true
        }
    ]).then(function(data) {
        data.restart ? getAllProducts(askQuestions) : connection.end();
        console.log('Goodbye!\n');
    })
}

function updateDB(id, stock, quant, price, callback) {
    var query = connection.query(
        'update products set stock_quantity = ? where item_id = ?',
        [(stock - quant), id],
        function(err, res) {
        callback(quant, price);       
    })   
}

function getTotal(quant, price) {
    console.log('\nYour total is: $'+ quant * price + '\n');
    restart();
}