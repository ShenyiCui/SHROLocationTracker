var path = require('path');
//gets the root directory the code is running in
module.exports = (function () {
	let s = path.dirname(require.main.filename || process.mainModule.filename);
	//getting rid of /bin so that it's the root directory of the file and not the server that's running.
	return s.substring(0, s.lastIndexOf('/'));
})();
