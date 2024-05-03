import { MMTSettings } from "../settings/mmt_settings.js";

const MMT_Settings = MMTSettings.Ins();

export class AttributeWindow
{
    constructor(root)
    {
        this._uiRoot = root;
        this._root = $('<div></div>')
        .css({
            background: 'rgba(0, 0, 0, 0.9)',
            position: 'absolute',
            cursor: 'pointer',
            pointerEvents: 'auto',
            'max-width': '20%',
        })
        .draggable({ containment: this._uiRoot });
        this._uiRoot.append(this._root);
        MMT_Settings.RegisterOnChangedCallBack(this.ApplyMMTSettings.bind(this));
    }

    OnGroupTitleClicked(groupTitleDiv)
    {
        let collapsed = groupTitleDiv.attr("collapsed") == "true";
        let groupIndex = parseInt(groupTitleDiv.attr("groupIndex"));
        let groupTitle = groupTitleDiv.attr("groupTitle");
        let groupRows = $(`#mmt_attr_table tr[groupIndex="${groupIndex}"]`);
        collapsed = !collapsed;
        groupTitleDiv.attr("collapsed", collapsed);
        if(collapsed)
        {
            groupRows.hide();
            groupTitleDiv.html(`${groupTitle}<b style="color: white;">[+]</b>`);
        }
        else
        {
            groupRows.show();
            groupTitleDiv.html(`${groupTitle}<b style="color: white;">[-]</b>`);
        }
    }

    Setup(attributeData, particularsData)
    {
        if(attributeData.length < 1 && particularsData.length < 1) return;
        this._root.empty();
        let attrTable = $('<table id="mmt_attr_table"></table>')
        .css({
            'border-collapse': 'collapse',
            width: '100%',
            border: '1px solid white',
        });
        this._root.append(attrTable);
        let groupIndex = 0;
        for(let attrGroup of attributeData)
        {
            let groupTitle = attrGroup.GroupName;
            let groupTitleDiv = $('<div></div>')
                .attr("collapsed", false)
                .attr("groupIndex", groupIndex)
                .attr("groupTitle", groupTitle)
                .html(`${groupTitle}<b style="color: white;">[-]</b>`)
            let groupRow = $('<tr></tr>');
            let groupTitleTh = $('<th colspan="2"></th>')
            .css({
                border: '1px solid white',
                padding: '1px',
                'text-align': 'middle',
                'color': 'yellow'
            })
            .append(groupTitleDiv);
            groupTitleDiv.click(this.OnGroupTitleClicked.bind(this, groupTitleDiv));
            groupRow.append(groupTitleTh);
            attrTable.append(groupRow);
            let attrIndex = 0;
            let curRow = null;
            for(let attr of attrGroup.Attributes)
            {
                let attrTitle = attr.Name;
                let attrValue = attr.Value;
                if(attrIndex % 2 == 0)
                {
                    curRow = $('<tr></tr>')
                    .attr("groupIndex", groupIndex);
                    attrTable.append(curRow);
                }
                let attrTd = $('<td></td>')
                .attr("title", attrTitle)
                .css({
                    border: '1px solid white',
                    padding: '1px',
                    'text-align': 'left',
                })
                .html(`【${attrTitle}】：${attrValue}`);
                curRow.append(attrTd);
                attrIndex++;
            }
            groupIndex++;
        }
        for(let particularGroup of particularsData)
        {
            let groupTitle = particularGroup.GroupName;
            let groupTitleDiv = $('<div></div>')
                .attr("collapsed", false)
                .attr("groupIndex", groupIndex)
                .attr("groupTitle", groupTitle)
                .html(`${groupTitle}<b style="color: white;">[-]</b>`)
            let groupRow = $('<tr></tr>');
            let groupTitleTh = $('<th colspan="2"></th>')
            .css({
                border: '1px solid white',
                padding: '1px',
                'text-align': 'middle',
                'color': 'yellow'
            })
            .append(groupTitleDiv);
            groupTitleDiv.click(this.OnGroupTitleClicked.bind(this, groupTitleDiv));
            groupRow.append(groupTitleTh);
            attrTable.append(groupRow);
            for(let parti of particularGroup.Particulars)
            {
                let row = $('<tr></tr>')
                    .attr("groupIndex", groupIndex);
                attrTable.append(row);
                let particularTd = $('<td colspan="2"></td>')
                .attr("title", parti.Name)
                .css({
                    border: '1px solid white',
                    padding: '1px',
                    'text-align': 'left',
                })
                .html(`【${parti.Name}】：${"暂无数据"}`);
                row.append(particularTd);
            }
            groupIndex++;
        }
    }

    ApplyMMTSettings(mmtSettings)
    {
        this._root.css({
            'max-width': `${mmtSettings.era_attribute_window_width}%`,
            'font-size': `${mmtSettings.era_attribute_font_size}px`,
        });
    }

    Update(attributes, particulars)
    {
        for(let attr of attributes)
        {
            $(`#mmt_attr_table td[title="${attr.Name}"]`).html(`【${attr.Name}】：${attr.Value}`);
        }
        for(let particular of particulars)
        {
            $(`#mmt_attr_table td[title="${particular.Name}"]`).html(`【${particular.Name}】：${particular.Value}`);
        }
    }
}