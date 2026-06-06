"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
exports.getQuery = getQuery;
/** Safely get a route parameter as a string */
function getParam(req, name) {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
}
/** Safely get a query parameter as a string or undefined */
function getQuery(req, name) {
    const value = req.query[name];
    if (!value)
        return undefined;
    return Array.isArray(value) ? String(value[0]) : String(value);
}
//# sourceMappingURL=params.js.map