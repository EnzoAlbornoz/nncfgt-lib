"use strict";

// Import Functionalities
const parse = require("./parser");
// Normal Export
module.exports.parse = parse;
// ES6 Export
module.exports.default = {
	parse,
};
