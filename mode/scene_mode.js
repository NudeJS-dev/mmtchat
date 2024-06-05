import { MMTUtils } from "../mmtutils.js";

export class SceneMode
{
    constructor(mmtui)
    {
        this.MMT_UI = mmtui;
        this.firstMes = null;
    }

    Setup(charData)
    {
        this.firstMes = charData.first_mes.replaceAll('{{char}}', charData.name).replaceAll('{{user}}', MMTUtils.GetUserName());
    }

    OnBeforeUserMessageSend(message, isRoll)
    {
        MMTUtils.AddHiddenInfoToMessage(message, { SceneIndex: 0 });
    }

    OnReceivedMessage(messageId, message)
    {
        //
    }
}