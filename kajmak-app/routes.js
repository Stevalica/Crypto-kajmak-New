var kajmak = require('./controller.js');

module.exports = function(app) {

	app.get('/get_all_kajmak', function(req,res){
		kajmak.get_all_kajmak(req,res);
	});
}
