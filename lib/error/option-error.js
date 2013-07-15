'use strict';

// Option error type
function OptionError (msg) {
	this.message = msg;
}
OptionError.prototype = Object.create(Error.prototype);
OptionError.prototype.name = 'OptionError';
OptionError.prototype.constructor = OptionError;

module.exports = OptionError;
