
import { MMTMode } from "./mmtmode.js";
import { MMTUtils } from "./mmtutils.js";
import { MMTTags } from "./mmttags.js";

const MMT_Mode = new MMTMode();
const MMT_Tags = new MMTTags();

export class MMTCallbacks {};

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
    MMTUtils.AddMMTInfoToMessage(message);
}

MMTCallbacks.OnSelectCharacter = function(charData)
{
    MMT_Mode.OnSelectCharacter(charData);
    MMT_Tags.OnSelectCharacter(charData);
}

MMTCallbacks.OnBeforeCommandMessageSend = function(message)
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

MMTCallbacks.OnBeforeUserMessageSend = function(message, isRoll)
{
    MMT_Mode.OnBeforeUserMessageSend(message, isRoll);
    MMT_Tags.OnBeforeUserMessageSend(message, isRoll);
}

MMTCallbacks.OnReceivedMessage = function(messageId, message)
{
    MMT_Mode.OnReceivedMessage(messageId, message);
    MMT_Tags.OnReceivedMessage(messageId, message);
}