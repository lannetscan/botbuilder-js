import { DialogSet, CompositeControl, ChoicePrompt, TextPrompt, FoundChoice } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder';

export interface FirstRunSettings {
    /** Current Terms Of Use (TOU) version number. */
    currentTouVersion: number;

    /** Initial TOU statement. */
    touStatement: string|Partial<Activity>;

    /** (Optional) upgraded TOU statement. */
    upgradedTouStatement?: string;

    /** (Optional) retry prompt to send if user fails to accept TOU. */
    retryPrompt?: string;

    /** (Optional) message to show a new user before prompting them for their profile info. */
    newUserMessage?: string|Partial<Activity>;
}

export interface UserProfile {
    touVersion: number;
    name: string;
    email: string;
}

interface FirstRunArgs {
    settings: FirstRunSettings;
    profile?: UserProfile;
}

export class FirstRunControl extends CompositeControl<UserProfile, FirstRunArgs> {
    constructor(settings: FirstRunSettings) {
        super(dialogs, 'firstRun', { settings: settings })
    } 
}

//---------------------------------------------------------
// FirstRun Implementation
//---------------------------------------------------------

const dialogs = new DialogSet();

dialogs.add('firstRun', [
    async function (dc, args: FirstRunArgs) {
        // Has user accepted current TOU?
        if (args.profile && args.profile.touVersion >= args.settings.currentTouVersion) {
            // User is good so return profile.
            return dc.end(args.profile);
        }

        // Persist args between turns
        dc.instance.state = args;

        // Confirm TOU acceptance
        return dc.begin('confirmTOU', args);
    },
    async function (dc) {
        // Is this an existing user?
        const args = dc.instance.state as FirstRunArgs;
        if (args.profile) {
            // Update TOU version and return profile.
            args.profile.touVersion = args.settings.currentTouVersion;
            return dc.end(args.profile);
        }

        // Populate profile
        return dc.begin('populateProfile', args);
    },
    async function (dc, profile) {
        // Return profile
        return dc.end(profile);
    }
]);

dialogs.add('confirmTOU', [
    async function (dc, args: FirstRunArgs) {
        // Determine prompt text to send.
        const choices = ['I Agree'];
        if (!args.profile || !args.settings.upgradedTouStatement) {
            await dc.prompt('choicePrompt', args.settings.touStatement, choices, { retryPrompt: args.settings.retryPrompt });
        } else {
            await dc.prompt('choicePrompt', args.settings.upgradedTouStatement, choices, { retryPrompt: args.settings.retryPrompt });
        }
    },
    async function (dc, choice: FoundChoice) {
        // We can ignore selected choice as we just wanted them to accept
        return dc.end();
    }
]);

dialogs.add('choicePrompt', new ChoicePrompt());

dialogs.add('populateProfile', [
    async function (dc, args: FirstRunArgs) {
        // Initialize profile
        const profile = { touVersion: args.settings.currentTouVersion } as UserProfile;
        dc.instance.state = profile;

        // Show new user message.
        if (args.settings.newUserMessage) {
            await dc.context.sendActivity(args.settings.newUserMessage);
        }

        // Prompt user for name
        return dc.prompt('namePrompt', `What is your name?`);
    },
    async function (dc, name: string) {
        // Save name
        const profile = dc.instance.state as UserProfile;
        profile.name = name;

        // Prompt user for email address
        return dc.prompt('emailPrompt', `What is your email address (first last)?`);
    },
    async function (dc, email: string) {
        // Save email address
        const profile = dc.instance.state as UserProfile;
        profile.email = email;

        // Return profile
        return dc.end(profile);
    }
]);


dialogs.add('namePrompt', new TextPrompt(async (context, value) => {
    // Validate value
    const name = (value || '').trim();
    const match = /[a-zA-Z]+\s(?:[a-zA-Z]|-)+/i.exec(name);
    if (match && match[0].length === name.length) {
        return name;
    }

    // Notify user of error
    await context.sendActivity(`I didn't recognize that. Please enter your First and Last name like "Mary Clark-Smith".`);
    return undefined;
}));

dialogs.add('emailPrompt', new TextPrompt(async (context, value) => {
    // Validate value
    const email = (value || '').trim();
    const match = /([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})/i.exec(name);
    if (match) {
        return match[0];
    }

    // Notify user of error
    await context.sendActivity(`I didn't recognize that. Please enter your email address like "mary-clark-smith@example.com".`);
    return undefined;
}));
