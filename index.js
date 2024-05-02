import { eventSource, event_types } from "../../../../script.js";
import { getContext } from "../../../extensions.js";
import { delay } from '../../../utils.js';

import { MMTUtils } from "./mmtutils.js";
import { MMTSettings } from "./settings/mmt_settings.js";
import { MMTCallbacks } from "./mmtcallbacks.js";

eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
eventSource.on(event_types.MESSAGE_SENT, handleMessageSent);
eventSource.on(event_types.GENERATION_STARTED, handleGenerationStart);
eventSource.on(event_types.MESSAGE_RECEIVED, handleReceivedMessage);

await MMTSettings.Ins().Setup();

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

function handleMessageSent(index)
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
        MMTCallbacks.OnBeforeUserMessageSend(message, false);
    }
}

function handleGenerationStart(type, options, dryRun)
{
    if(dryRun) return;
    let inputText = $('#send_textarea').val();
    if(inputText.length > 0) return;
    const oaInfo = MMTUtils.GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
	const context = getContext();
    if(context.chat.length < 2) return;
    const LastMesage = context.chat[context.chat.length - 1];
    const PrevMessage = context.chat[context.chat.length - 2];
    let message = null;
    let isRoll = false;
    if(LastMesage.is_user) message = LastMesage;
    if(!LastMesage.is_user && PrevMessage.is_user)
    {
        isRoll = true;
        message = PrevMessage;
    }
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
        MMTCallbacks.OnBeforeUserMessageSend(message, isRoll);
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
    MMTCallbacks.OnReceivedMessage(messageId, context.chat[messageId]);
	return true;
}