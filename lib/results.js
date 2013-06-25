'use strict';

var _ = require('underscore');

// Message types
var messageTypeMap = {
	1: 'error',
	2: 'warning',
	3: 'notice'
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

// Build a result object
exports.build = function (rawMessages) {
	var messages = exports.sanitizeMessages(rawMessages);
	var messageCounts = _.countBy(messages, 'type');
	return {
		isPerfect: (messages.length === 0),
		count: {
			total: messages.length,
			error: messageCounts.error || 0,
			warning: messageCounts.warning || 0,
			notice: messageCounts.notice || 0
		},
		results: messages
	};
};
