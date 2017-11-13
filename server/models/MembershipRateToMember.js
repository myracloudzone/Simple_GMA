var Bookshelf = require('bookshelf').DB;
var Deferred  = require("promised-io/promise").Deferred;
var async     = require( 'async' );

var BaseModel = require( '../models/BaseModel' )();

var MembershipRateToMember = BaseModel.extend({
    tableName: 'membership_rate_to_member',
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
    return Bookshelf.model( 'MembershipRateToMember', MembershipRateToMember );
};
