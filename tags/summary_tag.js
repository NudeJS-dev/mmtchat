import { MMTUtils } from "../mmtutils.js";

export class SummaryTag
{
    constructor(mmtui)
    {
        this.MMT_UI = mmtui;
    }

    OnBeforeUserMessageSend(message, isRoll)
    {
        let allChats = MMTUtils.GetChat();
        allChats.map((message, index) => {
            if(message.is_user && message.mes.startsWith('<|MMT-Summary|>'))
            {
                let hiddenInfo = MMTUtils.GetHiddenInfoFromMessage(message);
                if(!hiddenInfo?.SummaryUuid)
                {
                    MMTUtils.AddHiddenInfoToMessage(message, { SummaryUuid: MMTUtils.CreateUUID() });
                }
            }
        });
    }

    OnReceivedMessage(messageId, message)
    {
        //
    }
}