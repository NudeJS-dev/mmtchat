import { MMTUI } from "./mmtui.js";

import { SummaryTag } from "./tags/summary_tag.js";

const MMT_UI = new MMTUI();

export class MMTTags
{
    constructor()
    {
        this.summaryTag = new SummaryTag(MMT_UI);
    }

    OnSelectCharacter(charData)
    {
        //
    }

    OnBeforeUserMessageSend(message, isRoll)
    {
        this.summaryTag.OnBeforeUserMessageSend(message, isRoll);
    }

    OnReceivedMessage(messageId, message)
    {
        this.summaryTag.OnReceivedMessage(messageId, message);
    }
}