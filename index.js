import { eventSource, event_types, setEditedMessageId } from "../../../../script.js";
import { getContext } from "../../../extensions.js";
import { delay } from '../../../utils.js';

const MMT_HOST = "chat.maomaotou.online";
// const MMT_HOST = "127.0.0.1";

eventSource.on(event_types.MESSAGE_SENT, handleMessageSent);
eventSource.on(event_types.GENERATION_STARTED, handleGenerationStart);
eventSource.on(event_types.MESSAGE_RECEIVED, handleReceivedMessage);

async function doMesCut(start, count)
{
	for (let i = 0; i < count; i++)
	{
        let done = false;
        let mesToCut = $('#chat').find(`.mes[mesid=${start}]`);
        setEditedMessageId(start);
        eventSource.once(event_types.MESSAGE_DELETED, () => {
            done = true;
        });
        mesToCut.find('.mes_edit_delete').trigger('click', { fromSlashCommand: true });
        while (!done) {
            await delay(1);
        }
    }
}

function GetOpenAIInfo()
{
    let reverseProxy = $("#openai_reverse_proxy").val();
    let proxyPassword = $("#openai_proxy_password").val();
    return { IsMMT: reverseProxy.indexOf(MMT_HOST) > 0, UserKey: proxyPassword };
}

function OnBefore_Switch_Send(message, cookieArr)
{
    let authorizationCookie = cookieArr.find(cookieString => cookieString.indexOf('authorization=') >= 0);
    let uniqueIdCookie = cookieArr.find(cookieString => cookieString.indexOf('uniqueId=') >= 0);
    if(!authorizationCookie || !uniqueIdCookie)
    {
        message.mes = "-switch invalid_authorization";
        return;
    }
    authorizationCookie = authorizationCookie.substring(authorizationCookie.indexOf('authorization=') + 14);
    let tailIndex = authorizationCookie.indexOf(';');
    let authorization = authorizationCookie.substring(0, tailIndex);
    uniqueIdCookie = uniqueIdCookie.substring(uniqueIdCookie.indexOf('uniqueId=') + 9);
    tailIndex = uniqueIdCookie.indexOf(';');
    let uniqueId = uniqueIdCookie.substring(0, tailIndex);
    message.mes = `-switch ${uniqueId} ${authorization}`;
}

function OnBeforeCommandMessageSend(message)
{
    let commandText = message.mes.substring(1);
    let commandParts = commandText.split(' ');
    let cmd = commandParts[0];
    let args = commandParts.slice(1);
    switch(cmd)
    {
        case 'switch':
            {
                OnBefore_Switch_Send(message, args);
                break;
            }
    }
}

async function handleMessageSent(index)
{
    const oaInfo = GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
    const context = getContext();
    const character = context.characters[context.characterId];
    character.description = `${character.data.description}\n[MMT_KEY]${oaInfo.UserKey}[/MMT_KEY]`;
    setTimeout(() => {
        character.description = character.data.description;
    }, 100);
    const message = context.chat[index];
    if(message && !message.op && message.is_user && message.mes.startsWith('-'))
    {
        OnBeforeCommandMessageSend(message);
        message.op = true;
    }
}

async function handleGenerationStart(type, options, dryRun)
{
    if(dryRun) return;
    const oaInfo = GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
	const context = getContext();
    const character = context.characters[context.characterId];
    character.description = `${character.data.description}\n[MMT_KEY]${oaInfo.UserKey}[/MMT_KEY]`;
    setTimeout(() => {
        character.description = character.data.description;
    }, 100);
    const message = context.chat[context.chat.length - 1];
    if(message && !message.op && message.is_user && message.mes.startsWith('-'))
    {
        OnBeforeCommandMessageSend(message);
        message.op = true;
    }
}

async function handleReceivedMessage(messageId)
{
    const context = getContext();
    context.chat.map(message => message.mes.startsWith('-') && (message.mes = `[MMT]${message.mes.substring(1)}`));
	return true;
}