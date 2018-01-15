var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var commonUtils = require("./CommonCtrl.js");
var productDAO = require('../dao/ProductDAO.js');
var moment = require('moment');

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
    };

    controller.getProductTransactionToMember = function(req, res, next) {
        var filter = {};
        if(req.query.sortField == null || req.query.sortField == '') {
            filter.sortField = 'name';
            filter.sortOrder = 'asc';
        } else {
            filter.sortField = req.query.sortField;
            filter.sortOrder = req.query.sortOrder;
        }
        filter.condition = {};
        filter.condition.accountId = req.headers.accountId;
        filter.condition.memberId = req.query.memberId;
        filter.condition.memberType = 1;
        productDAO.getProductTransactionToMember(filter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        });
    };

    controller.returnOrder = function(req, res, next) {
        console.log("---------------------------1111------------------------------");
        productDAO.getProductTransactionById(req.body.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, "No Record Found.", "No Record Found.", res, req);
            }
            // check whether order is cancelled or not
            var productTransaction = data;
            productDAO.checkForTransactionCancellation(req.body.id, req, res, function(dataResponse, error, req, res) {
                if(error) {
                    return logger.logResponse(500, "Error Occurred.", error, res, req);
                }
                if(dataResponse != null && dataResponse.id != null) {
                    return logger.logResponse(404, "Order has been already cancelled.", "Order has been already cancelled.", res, req);
                } else {
                    productTransaction.transactionType = 2;
                    productDAO.updateProductTransaction(req.body.id, req.headers.accountId, productTransaction, req, res, function(updatedProductTransaction, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, "Error Occurred.", error, res, req);
                        }
                        if(updatedProductTransaction == null) {
                            return logger.logResponse(404, "No Record Updated.", "No Record Updated.", res, req);
                        }
                        var productId = updatedProductTransaction.productId;
                        productDAO.find(productId, req, res, function(productDetails, error, req, res) {
                            if(error) {
                                return logger.logResponse(500, "Error Occurred.", error, res, req);
                            }
                            if(productDetails == null) {
                                return logger.logResponse(404, "No Record Found.", "No Record Found.", res, req);
                            }
                            var quantityLeft = parseFloat(productDetails.quantity_left);
                            var obj = {};
                            obj.quantity_left = quantityLeft + updatedProductTransaction.soldQuantity;
                            productDAO.update(productId, req.headers.accountId, obj, req, res, function(data, error, req, res) {
                                if(error) {
                                    return logger.logResponse(500, "Error Occurred.", error, res, req);
                                }
                                return logger.logResponse(200, "Successfully Created.", null, res, req);
                            });
                        });
                    })
                }
            });        
        });
    };

    controller.assignProductToUser = function(req, res, next) {
        var productId = req.body.productId;
        productDAO.find(productId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, "No Record Found.", "No Record Found.", res, req);
            }
            var quantityLeft = parseFloat(data.quantity_left);
            var quantityAsked = parseFloat(req.body.quantity);
            if(quantityAsked <= quantityLeft) {
                var obj = {};
                obj.productId = productId;
                obj.memberId = req.body.memberId;
                obj.memberType = req.body.memberType;
                obj.soldRate = data.selling_price;
                obj.dateCreated = moment().valueOf();
                obj.soldQuantity = quantityAsked;
                obj.accountId = req.headers.accountId;
                obj.transactionType = 1; // For sold 1 , for return 0
                productDAO.assignProductToUser(obj, req, res, function(data, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occurred.", error, res, req);
                    }
                    var obj = {};
                    obj.quantity_left = quantityLeft - quantityAsked;
                    productDAO.update(req.body.productId, req.headers.accountId, obj, req, res, function(data, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, "Error Occurred.", error, res, req);
                        }
                        return logger.logResponse(200, "Successfully Created.", null, res, req);
                    });

                })
            } else {
                return logger.logResponse(404, "This item is out of stock.", "No Record Found.", res, req);
            }
        });
    };
    return controller;
};