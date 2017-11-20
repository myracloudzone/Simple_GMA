
module.exports = function (app) {
    var transactionCtrl = app.controllers.TransactionCtrl;
    app.get('/transaction/getTotalAmount', transactionCtrl.getTotalAmount);
    app.get('/transaction/getTransactionHistoryForDashboard', transactionCtrl.getAllTransactionGroupByDate);
}; 