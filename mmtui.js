import { AttributeWindow } from "./ui/attribute_window.js";

export class MMTUI
{
    constructor()
    {
        this._root = $("<div id='mmt_root'></div>")
        .css({
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99999,
            pointerEvents: "none",
        });
        $("body").append(this._root);
        this.AttributeWindow = new AttributeWindow(this._root);
    }

    SetVisible(name, v)
    {
        this[name]?._root.css("display", v ? "flex" : "none");
    }

    SetupAttributeWindow(attributeData, particularsData)
    {
        this.AttributeWindow.Setup(attributeData, particularsData);
    }
}