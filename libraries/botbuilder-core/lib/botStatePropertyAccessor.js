"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/** NEW */
class BotStatePropertyAccessor {
    constructor(state, name) {
        this.state = state;
        this.name = name;
    }
    delete(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.state.read(context);
            if (obj.hasOwnProperty(this.name)) {
                delete obj[this.name];
            }
        });
    }
    get(context, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.state.read(context);
            if (!obj.hasOwnProperty(this.name) && defaultValue !== undefined) {
                const clone = typeof defaultValue === 'object' || Array.isArray(defaultValue) ? JSON.parse(JSON.stringify(defaultValue)) : defaultValue;
                obj[this.name] = clone;
            }
            return obj[this.name];
        });
    }
    set(context, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.state.read(context);
            obj[this.name] = value;
        });
    }
}
exports.BotStatePropertyAccessor = BotStatePropertyAccessor;
//# sourceMappingURL=botStatePropertyAccessor.js.map