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
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to enter a datetime expression.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be
 * overridden using a custom `PromptValidator`.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to reply with a
 * date and/or time. The recognized date/time will be passed as an argument to the callers next
 * waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('datetimePrompt', new DatetimePrompt(AlarmTimeValidator));
 *
 * dialogs.add('setAlarmTime', [
 *      async function (dc) {
 *          await dc.prompt('datetimePrompt', `What time should I set your alarm for?`);
 *      },
 *      async function (dc, time) {
 *          await dc.context.sendActivity(`Alarm time set`);
 *          await dc.end();
 *      }
 * ]);
 *
 * async function AlarmTimeValidator(context, values) {
 *     try {
 *         if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
 *         if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
 *         const value = new Date(values[0].value);
 *         if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
 *         return value;
 *     } catch (err) {
 *         await context.sendActivity(`Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
 *         return undefined;
 *     }
 * }
 * ```
 */
class DatetimePrompt extends prompt_1.Prompt {
    /**
     * Creates a new `DatetimePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId, validator, defaultLocale) {
        super(dialogId, validator);
        this.prompt = prompts.createDatetimePrompt(undefined, defaultLocale);
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield this.prompt.prompt(context, options.retryPrompt);
            }
            else if (options.prompt) {
                yield this.prompt.prompt(context, options.prompt);
            }
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.prompt.recognize(context);
            return value !== undefined ? { succeeded: true, value: value } : { succeeded: false };
        });
    }
}
exports.DatetimePrompt = DatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map