
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
	item_id INTEGER NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(100) null,
	department_name VARCHAR(100) NULL,
	price DECIMAL(10,2) NULL,
	stock_quantity INTEGER(11) NULL,
	PRIMARY KEY (item_id)
)