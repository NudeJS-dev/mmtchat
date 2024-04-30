
import { MMTMode } from "./mmtmode.js";

const MMT_Mode = new MMTMode();

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
}

MMTCallbacks.OnSelectCharacter = function(charData)
{
    MMT_Mode.OnSelectCharacter(charData);
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

MMTCallbacks.OnBeforeUserMessageSend = function(message)
{
    MMT_Mode.OnBeforeUserMessageSend(message);
}