var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var commonUtils = require("./CommonCtrl.js");
var productDAO = require('../dao/ProductDAO.js');

module.exports = function(app) {
    var controller = {};
    controller.addProduct = function(req, res, next) {
        if(commonUtils.isEmptyString(req.body.name)) {
            return logger.logResponse(404, "Product Name is required.", "Product Name is required.", res, req);
        } else if(commonUtils.isEmptyString(req.body.costPrice)) {
            return logger.logResponse(404, "Cost Price is required.", "Cost Price is required.", res, req);
        } else if(commonUtils.isEmptyString(req.body.sellingPrice)) {
            return logger.logResponse(404, "Selling Price is required.", "Selling Price is required.", res, req);
        } else if(commonUtils.isEmptyString(req.body.quantity)) {
            return logger.logResponse(404, "Quantity is required.", "Quantity is required.", res, req);
        } 
        var obj = {};
        obj.accountId = req.headers.accountId;
        obj.name = req.body.name;
        obj.description = req.body.description;
        obj.cost_price = req.body.costPrice; 
        obj.selling_price = req.body.sellingPrice;
        obj.quantity = req.body.quantity;
        obj.quantity_left = req.body.quantity;
        obj.active = true;
        productDAO.save(obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    };
    controller.getProducts = function(req, res, next) {
        var obj = {};
        obj.accountId = req.headers.accountId;
        obj.active = true;
        productDAO.findAll(obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    };
    controller.getProductById = function(req, res, next) {
        productDAO.find(req.query.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            var obj = {};
            obj.id = data.id;
            obj.accountId = data.accountId;
            obj.name = data.name;
            obj.description = data.description;
            obj.costPrice = parseFloat(data.cost_price);
            obj.sellingPrice = parseFloat(data.selling_price);
            obj.quantity = data.quantity;
            obj.quantityLeft = data.quantity_left;
            obj.active = data.active;
            return logger.logResponse(200, obj, null, res, req);
        })
    };

    controller.updateProduct = function(req, res, next) {
        productDAO.find(req.body.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, "No Record Found.", "No Record Found.", res, req);
            }
            var oldCount = parseFloat(data.quantity) - parseFloat(data.quantity_left);
            var obj = {};
            obj.accountId = req.headers.accountId;
            obj.name = req.body.name;
            obj.description = req.body.description;
            obj.cost_price = parseFloat(req.body.costPrice); 
            obj.selling_price = parseFloat(req.body.sellingPrice);
            obj.quantity = parseFloat(req.body.quantity);
            obj.quantity_left = obj.quantity - oldCount;
            obj.active = true;
            productDAO.update(req.body.id, req.headers.accountId, obj, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, "Error Occurred.", error, res, req);
                }
                return logger.logResponse(200, "Successfully Updated.", null, res, req);
            });
        });
    };
    
    controller.deleteProduct = function(req, res, next) {
        var obj = {active : false};
        productDAO.update(req.body.id, req.headers.accountId, obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, "Successfully Deleted.", null, res, req);
        })
    }
    return controller;
};