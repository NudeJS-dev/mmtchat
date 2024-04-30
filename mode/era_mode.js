import { getContext } from "../../../../extensions.js";
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

    GenerateEraData()
    {
        let eraData = {};
        let saveData = MMTUtils.GetSaveDataInChat0();
        if(!saveData.history) saveData.history = [];
        if(saveData.history.length < 1) saveData.history.push(this.firstMes);
        eraData.history = saveData.history;
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

    OnBeforeUserMessageSend(message)
    {
        let eraData = this.GenerateEraData();
        MMTUtils.AddHiddenInfoToMessage(message, eraData);
    }
}