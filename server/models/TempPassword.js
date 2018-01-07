var Bookshelf = require('bookshelf').DB;
var Deferred  = require("promised-io/promise").Deferred;
var async     = require( 'async' );

var BaseModel = require( '../models/BaseModel' )();

var TempPassword = BaseModel.extend({
    tableName: 'temp_password',
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
    return Bookshelf.model( 'TempPassword', TempPassword );
};

// ------------------Type Id ---------------//
//Type Id 1  -- >    Login Temporary Password