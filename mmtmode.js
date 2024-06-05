import { MMTUI } from "./mmtui.js";

import { EraMode } from "./mode/era_mode.js";
import { SceneMode } from "./mode/scene_mode.js";

const MODE_NONE = 0;
const MODE_ERA = 1;
const MODE_SCENE = 2;

const MMT_UI = new MMTUI();

export class MMTMode
{
    constructor()
    {
        this.CurrentMode = MODE_NONE;
        this.eraMode = new EraMode(MMT_UI);
        this.sceneMode = new SceneMode(MMT_UI);
    }

    OnSelectCharacter(charData)
    {
        this.CurrentMode = MODE_NONE;
        let charDesc = charData.description;
        let IsEraMode = charDesc.startsWith('<MMT-ERA-MODE>') && charDesc.endsWith('</MMT-ERA-MODE>');
        let IsSceneMode = charDesc.startsWith('<MMT-SCENE-MODE>') && charDesc.endsWith('</MMT-SCENE-MODE>');
        MMT_UI.SetVisible('AttributeWindow', IsEraMode);
        if(IsEraMode)
        {
            this.CurrentMode = MODE_ERA;
            this.eraMode.Setup(charData);
            return;
        }
        if(IsSceneMode)
        {
            this.CurrentMode = MODE_SCENE;
            this.sceneMode.Setup(charData);
            return;
        }
    }

    OnBeforeUserMessageSend(message, isRoll)
    {
        if(this.CurrentMode == MODE_NONE) return;
        if(this.CurrentMode == MODE_ERA) this.eraMode.OnBeforeUserMessageSend(message, isRoll);
        if(this.CurrentMode == MODE_SCENE) this.sceneMode.OnBeforeUserMessageSend(message, isRoll);
    }

    OnReceivedMessage(messageId, message)
    {
        if(this.CurrentMode == MODE_NONE) return;
        if(this.CurrentMode == MODE_ERA) this.eraMode.OnReceivedMessage(messageId, message);
        if(this.CurrentMode == MODE_SCENE) this.sceneMode.OnReceivedMessage(messageId, message);
    }
}