module.exports = function (app) {
    var productCtrl = app.controllers.ProductCtrl;
    app.post('/product/addProduct', productCtrl.addProduct);
    app.post('/product/deleteProduct', productCtrl.deleteProduct);
    app.get('/product/getProductById', productCtrl.getProductById);
    app.get('/product/list', productCtrl.getProducts);
    app.post('/product/updateProduct', productCtrl.updateProduct);
}; 