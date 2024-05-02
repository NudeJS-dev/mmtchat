import { extension_settings, renderExtensionTemplateAsync } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';

let instance = null;

const defaultSettings = {
    era_attribute_window_width: 30,
    era_attribute_font_size: 16,
};

export class MMTSettings
{
    constructor()
    {
        this.OnSettingsChangedCallBacks = [];
    }

    RegisterOnChangedCallBack(callback)
    {
        this.OnSettingsChangedCallBacks.push(callback);
    }

    ApplySettings()
    {
        for (const callback of this.OnSettingsChangedCallBacks)
        {
            callback(extension_settings.mmt);
        }
    }

    async loadSettings()
    {
        if(!extension_settings.mmt) extension_settings.mmt = {};
        if (Object.keys(extension_settings.mmt).length === 0)
        {
            Object.assign(extension_settings.mmt, defaultSettings);
        }
        for (const [key, value] of Object.entries(defaultSettings))
        {
            if (extension_settings.mmt[key] === undefined)
            {
                extension_settings.mmt[key] = value;
            }
        }
    
        $('#era_attribute_window_width').val(extension_settings.mmt.era_attribute_window_width).trigger('input');
        $('#era_attribute_font_size').val(extension_settings.mmt.era_attribute_font_size).trigger('input');
    }

    async Setup()
    {
        if (extension_settings.disabledExtensions.includes('MMTChat'))
        {
            return;
        }
        const settingsHtml = $(await renderExtensionTemplateAsync('third-party/MMTChat', 'html/dropdown', defaultSettings));
        $('#extensions_settings').append(settingsHtml);
        $('#era_attribute_window_width').on('input', this.onEraAttributeWindowWidthInput.bind(this));
        $('#era_attribute_font_size').on('input', this.onEraAttributeFontSizeInput.bind(this));
        await this.loadSettings();
    }

    onEraAttributeWindowWidthInput()
    {
        extension_settings.mmt.era_attribute_window_width = Number($('#era_attribute_window_width').val());
        $('#era_attribute_window_width_value').text(`${extension_settings.mmt.era_attribute_window_width}%`);
        saveSettingsDebounced();
        this.ApplySettings();
    }

    onEraAttributeFontSizeInput()
    {
        extension_settings.mmt.era_attribute_font_size = Number($('#era_attribute_font_size').val());
        $('#era_attribute_font_size_value').text(`${extension_settings.mmt.era_attribute_font_size}px`);
        $('#era_attribute_font_size_example').css('font-size', `${extension_settings.mmt.era_attribute_font_size}px`);
        saveSettingsDebounced();
        this.ApplySettings();
    }
}

MMTSettings.Ins = function()
{
    if(!instance) instance = new MMTSettings();
    return instance;
}