'use strict';

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
    return {
        isPerfect: (messages.length === 0),
        count: {
            total: messages.length,
            error: messages.filter(function (message) {
                return message.type === 'error';
            }).length,
            warning: messages.filter(function (message) {
                return message.type === 'warning';
            }).length,
            notice: messages.filter(function (message) {
                return message.type === 'notice';
            }).length
        },
        results: messages
    };
};
