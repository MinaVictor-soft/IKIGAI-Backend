"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const data = schema.parse(req[source]);
        req[source] = data;
        next();
    };
}
//# sourceMappingURL=validate.js.map