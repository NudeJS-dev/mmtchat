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
    let plainMes = message0.mes.substring(0, saveIdx);
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
        plainMes = message.mes.substring(0, hiddenIdx);
        hiddenInfoText = message.mes.substring(hiddenIdx + 15);
        let tailIdx = hiddenInfoText.indexOf('-->');
        hiddenInfoText = hiddenInfoText.substring(0, tailIdx).trim();
    }
    let hiddenInfo = hiddenInfoText.length > 0 ? JSON.parse(hiddenInfoText) : {};
    hiddenInfo = Object.assign(hiddenInfo, infoData);
    message.mes = `${plainMes}\n<!-- HiddenInfo ${JSON.stringify(hiddenInfo)} -->`;
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