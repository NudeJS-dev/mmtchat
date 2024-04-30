import { eventSource, event_types } from "../../../../script.js";
import { getContext } from "../../../extensions.js";

import { MMTUtils } from "./mmtutils.js";
import { MMTCallbacks } from "./mmtcallbacks.js";

eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
eventSource.on(event_types.MESSAGE_SENT, handleMessageSent);
eventSource.on(event_types.GENERATION_STARTED, handleGenerationStart);
eventSource.on(event_types.MESSAGE_RECEIVED, handleReceivedMessage);

function handleChatChanged()
{
    const oaInfo = MMTUtils.GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
    const context = getContext();
    const character = context.characters[context.characterId];
    try
    {
        let charData = JSON.parse(character.json_data);
        MMTCallbacks.OnSelectCharacter(charData);
    }
    catch(err) { throw err; }
}

async function handleMessageSent(index)
{
    const oaInfo = MMTUtils.GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
    const context = getContext();
    const message = context.chat[index];
    if(message)
    {
        MMTUtils.CleanHiddenInfo(message);
        MMTUtils.AddMMTInfoToMessage(message);
    }
    if(message && message.is_user)
    {
        if(message.mes.startsWith('-'))
        {
            MMTCallbacks.OnBeforeCommandMessageSend(message);
            return;
        }
        MMTCallbacks.OnBeforeUserMessageSend(message);
    }
}

function handleGenerationStart(type, options, dryRun)
{
    if(dryRun) return;
    const oaInfo = MMTUtils.GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
	const context = getContext();
    if(context.chat.length < 2) return;
    const LastMesage = context.chat[context.chat.length - 1];
    const PrevMessage = context.chat[context.chat.length - 2];
    let message = null;
    if(LastMesage.is_user) message = LastMesage;
    if(!LastMesage.is_user && PrevMessage.is_user) message = PrevMessage;
    if(message)
    {
        MMTUtils.CleanHiddenInfo(message);
        MMTUtils.AddMMTInfoToMessage(message);
    }
    if(message && message.is_user)
    {
        if(message.mes.startsWith('-'))
        {
            MMTCallbacks.OnBeforeCommandMessageSend(message);
            return;
        }
        MMTCallbacks.OnBeforeUserMessageSend(message);
    }
}

function handleReceivedMessage(messageId)
{
    const context = getContext();
    context.chat.map((message, index) => {
        if(message.mes.startsWith('-'))
        {
            message.mes = `[MMT]${message.mes.substring(1)}`;
        }
        MMTUtils.CleanHiddenInfo(message);
    });
    let receivedMesText = context.chat[messageId].mes;
    // if(receivedMesText.indexOf('<ERAMode>') > 0)
    // {
    //     updateMesInPage(messageId, "<h>this is a test</h>");
    // }
	return true;
}