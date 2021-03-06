/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from '../../botbuilder/lib';
import { DialogContext } from './dialogContext';
/**
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog.
 */
export interface DialogInstance<T = any> {
    /** ID of the dialog this instance is for. */
    id: string;
    /** The instances persisted state. */
    state: T;
}
export declare enum DialogReason {
    /** A dialog is being started through a call to `DialogContext.begin()`. */
    beginCalled = 0,
    /** A dialog is being continued through a call to `DialogContext.continue()`. */
    continueCalled = 1,
    /** A dialog ended normally through a call to `DialogContext.end()`. */
    endCalled = 2,
    /** A dialog is ending because its being replaced through a call to `DialogContext.replace()`. */
    replaceCalled = 3,
    /** A dialog was cancelled as part of a call to `DialogContext.cancelAll()`. */
    cancelCalled = 4,
    /** A step was advanced through a call to `WaterfallStepContext.next()`. */
    nextCalled = 5,
}
/**
 * Returned by `Dialog.begin()` and `Dialog.continue()` to indicate whether the dialog is still
 * active after the turn has been processed by the dialog.  This can also be used to access the
 * result of a dialog that just completed.
 * @param T (Optional) type of result returned by the dialog when it calls `dc.end()`.
 */
export interface DialogTurnResult<T = any> {
    /** If `true` a dialog is still active on the dialog stack. */
    hasActive: boolean;
    /** If `true` the dialog that was on the stack just completed and the final [result](#result) is available. */
    hasResult: boolean;
    /** Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true. */
    result?: T;
}
/**
 * Base class for all dialogs.
 */
export declare abstract class Dialog<O extends object = {}> {
    /** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
    static EndOfTurn: DialogTurnResult;
    constructor(dialogId: string);
    readonly id: string;
    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param options (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    abstract dialogBegin(dc: DialogContext, options?: O): Promise<DialogTurnResult>;
    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user
     * replies with a new activity. The dialog will generally continue to receive the users replies
     * until it calls `DialogContext.end()`, `DialogContext.begin()`, or `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.begin()` or
     * `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.end()`. Any result passed from the called dialog will be passed to the
     * active dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param reason The reason the dialog is being resumed. This will typically be a value of `DialogReason.endCalled`.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult>;
    /**
     * (Optional) method called when the dialog has been requested to re-prompt the user for input.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
    /**
     * (Optional) method called when the dialog is ending.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void>;
}
