var Bookshelf = require('bookshelf').DB;
var Deferred  = require("promised-io/promise").Deferred;
var async     = require( 'async' );

var BaseModel = require( '../models/BaseModel' )();

var ProductTransaction = BaseModel.extend({
    tableName: 'productTransaction',
    format: function( attrs ) {
	    if ( attrs.data )
	        attrs.data = JSON.stringify( attrs.data );
	    return attrs;
    },
    parse: function( attrs ) {
	    if ( attrs.data )
	        attrs.data = JSON.parse( attrs.data );
	        return attrs;
        }
});

module.exports = function( app ) {
    return Bookshelf.model( 'ProductTransaction', ProductTransaction );
};

// TransactionType : {
//             1 : sold,
//             2 : return
// }

// MemberId : {
//       It can be either a member of gym or user of the app.
// }
// MemberType : {
//       1: Gym Member
//       2. App User
// }