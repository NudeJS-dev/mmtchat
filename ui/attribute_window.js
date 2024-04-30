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
        })
        .draggable({ containment: this._uiRoot });
        this._uiRoot.append(this._root);
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
        for(let attrGroup of attributeData)
        {
            let groupTitle = attrGroup.GroupName;
            let groupRow = $('<tr></tr>');
            let groupTitleTh = $('<th colspan="4"></th>')
            .css({
                border: '1px solid white',
                padding: '4px',
                'text-align': 'middle',
                'color': 'yellow'
            })
            .html(groupTitle);
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
                    curRow = $('<tr></tr>');
                    attrTable.append(curRow);
                }
                let titleTd = $('<td></td>')
                .css({
                    border: '1px solid white',
                    padding: '8px',
                    'text-align': 'left',
                })
                .html(attrTitle);
                curRow.append(titleTd);
                let valueTd = $('<td></td>')
                .css({
                    border: '1px solid white',
                    padding: '8px',
                    'text-align': 'right',
                })
                .html(attrValue);
                curRow.append(valueTd);
                attrIndex++;
            }
        }
        for(let particularGroup of particularsData)
        {
            let groupTitle = particularGroup.GroupName;
            let groupRow = $('<tr></tr>');
            let groupTitleTh = $('<th colspan="4"></th>')
            .css({
                border: '1px solid white',
                padding: '4px',
                'text-align': 'middle',
                'color': 'yellow'
            })
            .html(groupTitle);
            groupRow.append(groupTitleTh);
            attrTable.append(groupRow);
            for(let parti of particularGroup.Particulars)
            {
                let row = $('<tr></tr>');
                attrTable.append(row);
                let titleTd = $('<td></td>')
                .css({
                    border: '1px solid white',
                    padding: '8px',
                    'text-align': 'left',
                })
                .html(parti.Name);
                row.append(titleTd);
                let valueTd = $('<td colspan="3"></td>')
                .css({
                    border: '1px solid white',
                    padding: '8px',
                    'text-align': 'right',
                })
                .html("暂无数据");
                row.append(valueTd);
            }
        }
    }
}