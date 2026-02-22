'use strict';

/**
 * Traverses a number of directories trying to load a config file from them
 * @param {String[]} stack - A list of directories
 * @param {Object} defaultReturn - The object to return if no config is found
 * @returns {Object} A config object
 */
function requireFirst(stack, defaultReturn) {
	if (!stack.length) {
		return defaultReturn;
	}
	try {
		return require(stack.shift());
	} catch (error) {
		if (error.code === 'MODULE_NOT_FOUND') {
			return requireFirst(stack, defaultReturn);
		}
		throw error;
	}
}

module.exports = {
	requireFirst
};
