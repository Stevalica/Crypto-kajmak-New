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

	app.get('/change_owner/:owner', function(req, res){
		console.log("\nZahtjev je primljen");
		kajmak.change_owner(req, res);
  });

	app.get('/delete_kajmak/:kajmakKey', function(req, res) {
		console.log("\nZahtjev je primljen");
		kajmak.delete_kajmak(req, res);
	});
}
