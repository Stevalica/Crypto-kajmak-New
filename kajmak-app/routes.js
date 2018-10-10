var kajmak = require('./controller.js');

module.exports = function(app) {

	//server prima zahtjev na adresi /get_all_kajmak/
	app.get('/get_all_kajmak', function(req, res){
		console.log("zahtjev poslan");
    	kajmak.get_all_kajmak(req, res);
  });

	app.get('/add_kajmak/:kajmak', function(req, res){
		console.log("zahtjev poslan");
    	kajmak.add_kajmak(req, res);
  });
}
