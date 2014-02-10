// This file is part of pa11y.
// 
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

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
