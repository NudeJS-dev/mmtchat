import { eventSource, event_types, setEditedMessageId } from "../../../../script.js";
import { getContext } from "../../../extensions.js";
import { delay } from '../../../utils.js';

export class MMTUtils {}

const MMT_HOST = "chat.maomaotou.online";

MMTUtils.GetOpenAIInfo = function()
{
    let reverseProxy = $("#openai_reverse_proxy").val();
    let proxyPassword = $("#openai_proxy_password").val();
    return { IsMMT: reverseProxy.indexOf(MMT_HOST) > 0 || reverseProxy.indexOf('127.0.0.1:5000') > 0, UserKey: proxyPassword };
}

MMTUtils.UpdateMesInPage = async function(mesId, mesText)
{
    let mesToEdit = $('#chat').find(`.mes[mesid=${mesId}]`);
    let mesBlock = mesToEdit.find('.mes_block');
    let fakeEditTextArea = $('<textarea id="curEditTextarea" class="edit_textarea" style="display:none"></textarea>');
    mesBlock.append(fakeEditTextArea);
    fakeEditTextArea.val(mesText);
    let done = false;
    setEditedMessageId(mesId);
    eventSource.once(event_types.MESSAGE_EDITED, () => {
        done = true;
    });
    mesToEdit.find('.mes_edit_done').trigger('click', { fromSlashCommand: true });
    while (!done) {
        await delay(1);
    }
    fakeEditTextArea.remove();
}

MMTUtils.GetSaveDataInChat0 = function()
{
    const context = getContext();
    if(!context || !context.chat || context.chat.length < 1) return {};
    let message0 = context.chat[0];
    let saveIdx = message0.mes.indexOf('<!-- SaveData');
    if(saveIdx < 0)
    {
        message0.mes = `${message0.mes}\n<!-- SaveData {} -->`;
        return {};
    }
    let saveDataText = message0.mes.substring(saveIdx + 13);
    let tailIdx = saveDataText.indexOf('-->');
    saveDataText = saveDataText.substring(0, tailIdx).trim();
    let saveData = {};
    try
    {
        saveData = JSON.parse(saveDataText);
    }
    catch(err) { throw err; }
    return saveData;
}

MMTUtils.SetSaveDataInChat0 = function(saveData)
{
    const context = getContext();
    if(!context || !context.chat || context.chat.length < 1) return;
    let message0 = context.chat[0];
    let saveIdx = message0.mes.indexOf('<!-- SaveData');
    if(saveIdx < 0)
    {
        message0.mes = `${message0.mes}\n<!-- SaveData ${JSON.stringify(saveData)} -->`;
        return;
    }
    let plainMes = message0.mes.substring(0, saveIdx).trim();
    message0.mes = `${plainMes}\n<!-- SaveData ${JSON.stringify(saveData)} -->`;
}

MMTUtils.CheckCondition = function(val, conditionText)
{
    if(!conditionText || conditionText.length < 1) return false;
    let eqFlag = conditionText.length > 1 && conditionText[1] === '=';
    let jFlag = conditionText[0];
    let jValText = conditionText.substring(eqFlag ? 2 : 1);
    let jVal = parseInt(jValText);
    if(jFlag === '>') return eqFlag ? (val >= jVal) : (val > jVal);
    if(jFlag === '<') return eqFlag ? (val <= jVal) : (val < jVal);
    return val == jVal;
}

MMTUtils.GetUserName = function()
{
    const context = getContext();
    if(!context) return '';
    return context.name1;
}

MMTUtils.AddHiddenInfoToMessage = function(message, infoData)
{
    let plainMes = message.mes;
    let hiddenInfoText = '';
    let hiddenIdx = message.mes.indexOf('<!-- HiddenInfo');
    if(hiddenIdx > -1)
    {
        plainMes = message.mes.substring(0, hiddenIdx).trim();
        hiddenInfoText = message.mes.substring(hiddenIdx + 15);
        let tailIdx = hiddenInfoText.indexOf('-->');
        if(tailIdx > -1) hiddenInfoText = hiddenInfoText.substring(0, tailIdx).trim();
    }
    let hiddenInfo = hiddenInfoText.length > 0 ? JSON.parse(hiddenInfoText) : {};
    hiddenInfo = Object.assign(hiddenInfo, infoData);
    message.mes = `${plainMes}\n<!-- HiddenInfo ${JSON.stringify(hiddenInfo)} -->`;
}

MMTUtils.GetHiddenInfoFromMessage = function(message)
{
    let hiddenIndex = message.mes.indexOf('<!-- HiddenInfo');
    if(hiddenIndex < 0) return null;
    let hiddenInfoText = message.mes.substring(hiddenIndex + 15);
    let tailIdx = hiddenInfoText.indexOf('-->');
    if(tailIdx < 0) return null;
    hiddenInfoText = hiddenInfoText.substring(0, tailIdx).trim();
    let hiddenInfo = {};
    try
    {
        hiddenInfo = JSON.parse(hiddenInfoText);
    }
    catch(err) { return null; }
    return hiddenInfo;
}

MMTUtils.AddMMTInfoToMessage = function(message)
{
    const oaInfo = MMTUtils.GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
    MMTUtils.AddHiddenInfoToMessage(message, { MMTKey: `[MMT_KEY]${oaInfo.UserKey}[/MMT_KEY]` });
}

MMTUtils.CleanHiddenInfo = function(message)
{
    let hiddenIndex = message.mes.indexOf('<!-- HiddenInfo');
    if(hiddenIndex > -1)
    {
        message.mes = message.mes.substring(0, hiddenIndex).trim();
    }
}

MMTUtils.GetTagContent = function(tag, content)
{
    let idx1 = content.indexOf(`<${tag}>`);
    let idx2 = content.indexOf(`</${tag}>`);
    if(idx1 < 0 || idx2 < 0 || idx1 >= idx2) return '';
    return content.substring(idx1 + tag.length + 2, idx2).trim();
}

MMTUtils.GetChat = function()
{
    const context = getContext();
    if(!context || !context.chat || context.chat.length < 1) return [];
    return context.chat;
}

MMTUtils.GetChatMessage = function(messageId)
{
    if(messageId < 0) return null;
    const context = getContext();
    if(!context || !context.chat || context.chat.length < 1) return null;
    return context.chat[messageId];
}

MMTUtils.CreateUUID = function()
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}