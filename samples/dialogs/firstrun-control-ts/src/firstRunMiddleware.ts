import { Middleware, TurnContext } from 'botbuilder';
import { FirstRunControl, FirstRunSettings, UserProfile } from './firstRunControl';

export interface StateBinding<T> {
    /** Returns a bound value. */
    get(context: TurnContext): Promise<T|undefined>;

    /** Updates a bound value. */
    set(context: TurnContext, state: T|undefined): Promise<void>;
}

export class FirstRunMiddleware implements Middleware {
    private control: FirstRunControl;

    constructor(private conversationState: StateBinding<object>, private profile: StateBinding<UserProfile>, settings: FirstRunSettings) {
        this.control = new FirstRunControl(settings);
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === 'message') {
            // Get conversation state
            const state = await this.conversationState.get(context);
            
            // Are we in a conversation?
            if (state) {
                const result = await this.control.continue(context, state);
                if (result.active) {
                    // Prevent further routing
                    return Promise.resolve();
                }

                // Save profile and delete conversation state
                await this.profile.set(context, result.result);
                await this.conversationState.set(context, undefined);
            } else {
                // Get user profile
                const profile = await this.profile.get(context);

                // Check for new user or TOU update
                const state = {};
                const result = await this.control.begin(context, state);
                if (result.active) {
                    // Save state and prevent further routing
                    await this.conversationState.set(context, state);
                    return Promise.resolve();
                }
            }
        }
        return next();
    }

}

