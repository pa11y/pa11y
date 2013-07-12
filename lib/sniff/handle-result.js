'use strict';

var _ = require('underscore');

// Handle HTML CodeSniffer results
exports = module.exports = function (results, callback) {
	var messages = exports.sanitizeMessages(results);
	var messageCounts = _.countBy(messages, 'type');
	callback(null, {
		isPerfect: (messages.length === 0),
		count: {
			total: messages.length,
			error: messageCounts.error || 0,
			warning: messageCounts.warning || 0,
			notice: messageCounts.notice || 0
		},
		results: messages
	});
};

// Turn messages into something usable by reporters
exports.sanitizeMessages = function (messages) {
	if (!Array.isArray(messages)) {
		return [];
	}
	return messages.map(function (message) {
		return {
			code: message.code,
			message: message.msg,
			type: messageTypeMap[message.type] || 'unknown'
		};
	});
};

// Message types
var messageTypeMap = {
	1: 'error',
	2: 'warning',
	3: 'notice'
};
