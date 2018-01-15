var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Product').forge().save(obj).then(function(product) {
            if(product == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(product.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, accountId, obj, req, res, callback) {
        schema.model('Product').forge().where({
            id: id,
            accountId: accountId
		}).fetch().then(function (product) {
			if (product) {
                product.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(result != null) {
                        callback(result.toJSON(), null, req, res);
                    } else {
                        callback(null, "Error Occurred.", req, res);
                    }
                }).catch(function (err) {
                    callback(null, err, req, res);
                });
			} else {
				callback(null, "Error Occurred.", req, res);
			}
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    delete : function(id, accountId, req, res, callback) {
        schema.model('Product').forge().where({
            id: id,
            accountId : req.headers.accountId
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('Product').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback({}, null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findAll : function(condition, req, res, callback) {
        schema.model('Product').forge().where(condition).orderBy('name', 'ASC').fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
        });
    },
    assignProductToUser : function(obj, req, res, callback) {
        schema.model('ProductTransaction').forge().save(obj).then(function(product) {
            if(product == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(product.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    getProductTransactionToMember : function(filter, req, res, callback) {
        schema.model('ProductTransaction').forge().query( function(qb) {
            qb.leftJoin('product', function() {
                this.on('product.id', '=', 'productTransaction.productId')
            })
            .where('productTransaction.accountId', filter.condition.accountId)
            .andWhere('productTransaction.memberId', filter.condition.memberId)
            .andWhere('productTransaction.memberType', filter.condition.memberType)
            .column('productTransaction.id as id', 'product.name','productTransaction.memberId', 'productTransaction.memberType', 'productTransaction.soldRate', `productTransaction.soldQuantity`, 'productTransaction.dateCreated',
            'productTransaction.accountId', `productTransaction.transactionType`, 'product.active as isProductActive')
            .orderBy(filter.sortField, filter.sortOrder)
            .debug(true);
        }).fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
        });
    },
    getProductTransactionById : function(id, req, res, callback) {
        schema.model('ProductTransaction').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback({}, null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    checkForTransactionCancellation : function(id, req, res, callback) {
        schema.model('ProductTransaction').forge().where({
            id: id,
            transactionType : 2
		}).fetch().then(function (result) {
            if(result == null) {
                callback({}, null, req, res);
            } else {
                callback(result.toJSON(), null, req, res);
            }
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    updateProductTransaction : function(id, accountId, obj, req, res, callback) {
        schema.model('ProductTransaction').forge().where({
            id: id,
            accountId: accountId
		}).fetch().then(function (productTransaction) {
			if (productTransaction) {
                productTransaction.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(result != null) {
                        callback(result.toJSON(), null, req, res);
                    } else {
                        callback(null, "Error Occurred.", req, res);
                    }
                }).catch(function (err) {
                    callback(null, err, req, res);
                });
			} else {
				callback(null, "Error Occurred.", req, res);
			}
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },     
}