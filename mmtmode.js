import { MMTUI } from "./mmtui.js";

import { EraMode } from "./mode/era_mode.js";

const MODE_NONE = 0;
const MODE_ERA = 1;

const MMT_UI = new MMTUI();

export class MMTMode
{
    constructor()
    {
        this.CurrentMode = MODE_NONE;
        this.eraMode = new EraMode(MMT_UI);
    }

    OnSelectCharacter(charData)
    {
        let charDesc = charData.description;
        let IsEraMode = charDesc.startsWith('<MMT-ERA-MODE>') && charDesc.endsWith('</MMT-ERA-MODE>');
        MMT_UI.SetVisible('AttributeWindow', IsEraMode);
        if(IsEraMode)
        {
            this.CurrentMode = MODE_ERA;
            this.eraMode.Setup(charData);
            return;
        }
    }

    OnBeforeUserMessageSend(message)
    {
        if(this.CurrentMode == MODE_NONE) return;
        if(this.eraMode) this.eraMode.OnBeforeUserMessageSend(message);
    }
}