import { MMTUtils } from "../mmtutils.js";

export class EraMode
{
    constructor(mmtui)
    {
        this.MMT_UI = mmtui;
        this.firstMes = null;
        this.attributes = [];
        this.particulars = [];
        this.defaultVals = { Attributes: {} };
    }

    Setup(charData)
    {
        this.firstMes = charData.first_mes.replaceAll('{{char}}', charData.name).replaceAll('{{user}}', MMTUtils.GetUserName());
        let tailIndex = this.firstMes.indexOf('<!--');
        if(tailIndex > -1)
        {
            this.firstMes = this.firstMes.substring(0, tailIndex);
        }
        let charDesc = charData.description;
        let attrHead = charDesc.indexOf('<Attributes>');
        let attrTail = charDesc.indexOf('</Attributes>');
        if(attrHead > -1 && attrTail > -1)
        {
            let attrJsonText = charDesc.substring(attrHead + 12, attrTail).trim();
            try
            {
                this.attributes = JSON.parse(attrJsonText);
                for(let attrGroup of this.attributes)
                {
                    for(let attr of attrGroup.Attributes)
                    {
                        this.defaultVals.Attributes[attr.Name] = attr.Value;
                    }
                }
            }
            catch(err) { throw err; };
        }
        let partiHead = charDesc.indexOf('<Particulars>');
        let partiTail = charDesc.indexOf('</Particulars>');
        if(partiHead > -1 && partiTail > -1)
        {
            let partiJsonText = charDesc.substring(partiHead + 13, partiTail).trim();
            try
            {
                this.particulars = JSON.parse(partiJsonText);
            }
            catch(err) { throw err; };
        }
        this.MMT_UI.SetupAttributeWindow(this.attributes, this.particulars);
    }

    GatherEraHistory(isRoll)
    {
        let history = [ `Assistant:\n${this.firstMes}` ];
        let allChat = MMTUtils.GetChat();
        allChat.map((message, index) => {
            if(index > 0 && index < allChat.length - 1)
            {
                if(isRoll && index == allChat.length - 2) return;
                if(message.is_user)
                {
                    history.push(`Human:\n${message.mes}`);
                    return;
                }
                let storyText = MMTUtils.GetTagContent('ERA_Story', message.mes);
                if(storyText.length > 0) history.push(`Assistant:\n${storyText}`);
            }
        });
        return history;
    }

    GenerateEraData(isRoll)
    {
        let eraData = {};
        let saveData = MMTUtils.GetSaveDataInChat0();
        eraData.history = this.GatherEraHistory(isRoll);
        if(!saveData.attributes) saveData.attributes = {};
        eraData.statusText = '';
        for(let attrGroup of this.attributes)
        {
            for(let attr of attrGroup.Attributes)
            {
                if(!saveData.attributes[attr.Name]) saveData.attributes[attr.Name] = this.defaultVals.Attributes[attr.Name];
                let attrVal = saveData.attributes[attr.Name];
                let statusText;
                let statusKeys = Object.keys(attr.Status);
                for(let condition of statusKeys)
                {
                    if(MMTUtils.CheckCondition(attrVal, condition))
                    {
                        statusText = attr.Status[condition];
                        break;
                    }
                }
                if(statusText) eraData.statusText = `${eraData.statusText}\n${statusText}`;
            }
        }
        eraData.statusText = eraData.statusText.trim();
        MMTUtils.SetSaveDataInChat0(saveData);
        return eraData;
    }

    OnBeforeUserMessageSend(message, isRoll)
    {
        let eraData = this.GenerateEraData(isRoll);
        MMTUtils.AddHiddenInfoToMessage(message, eraData);
    }

    OnReceivedMessage(messageId, message)
    {
        let originMes = message.mes;
        let eraModeText = MMTUtils.GetTagContent('ERAMode', originMes);
        if(eraModeText.length < 1) return;
        let storyText = MMTUtils.GetTagContent('ERA_Assistant_Response', eraModeText);
        let saveData = MMTUtils.GetSaveDataInChat0();
        let attrChangeText = MMTUtils.GetTagContent('ERA_Assistant_Attribute_Change', eraModeText).replaceAll('\r', '').replaceAll('\n', '');
        let attrs = [];
        const regex = /<Name>(.*?)<\/Name><Change>(.*?)<\/Change>/gi;
        let match;
        while ((match = regex.exec(attrChangeText)) !== null)
        {
            const name = match[1].trim();
            const value = parseInt(match[2].trim());
            saveData.attributes[name] += value;
            attrs.push({ Name: name, Value: saveData.attributes[name] });
        }
        let particulars = [];
        let particularText = MMTUtils.GetTagContent('ERA_Particulars_Change', eraModeText).replaceAll('\r', '').replaceAll('\n', '');
        while ((match = regex.exec(particularText)) !== null)
        {
            const name = match[1].trim();
            const value = match[2].trim();
            particulars.push({ Name: name, Value: value });
        }
        MMTUtils.SetSaveDataInChat0(saveData);
        MMTUtils.UpdateMesInPage(messageId, `<ERA_Story>\n${storyText}\n</ERA_Story>`);
        this.MMT_UI.UpdateAttributeWindow(attrs, particulars);
    }
}