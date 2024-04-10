import { eventSource, event_types, setEditedMessageId } from "../../../../script.js";
import { getContext } from "../../../extensions.js";
import { delay } from '../../../utils.js';

const MMT_HOST = "121.42.225.6";
// const MMT_HOST = "127.0.0.1";

eventSource.on(event_types.GENERATION_STARTED, handleGenerationStart);
eventSource.on(event_types.MESSAGE_RECEIVED, handleReceivedMessage);

async function doMesCut(start, count)
{
	for (let i = 0; i < count; i++)
	{
        let done = false;
        let mesToCut = $('#chat').find(`.mes[mesid=${start}]`);
        setEditedMessageId(start);
        eventSource.once(event_types.MESSAGE_DELETED, () => {
            done = true;
        });
        mesToCut.find('.mes_edit_delete').trigger('click', { fromSlashCommand: true });
        while (!done) {
            await delay(1);
        }
    }
}

function GetOpenAIInfo()
{
    let reverseProxy = $("#openai_reverse_proxy").val();
    let proxyPassword = $("#openai_proxy_password").val();
    return { IsMMT: reverseProxy.indexOf(MMT_HOST) > 0, UserKey: proxyPassword };
}

async function handleGenerationStart(type, options, dryRun)
{
    if(dryRun) return;
    const oaInfo = GetOpenAIInfo();
    if(!oaInfo.IsMMT) return;
	const context = getContext();
    const character = context.characters[context.characterId];
    character.description = `${character.data.description}\n[MMT_KEY]${oaInfo.UserKey}[/MMT_KEY]`;
    const message = context.chat[context.chat.length - 1];
    if(message && message.mes == '-roll')
    {
	    setTimeout(async () => {
		    await doMesCut(messageId - 1, 1);
	    }, 10);
    }
}

async function handleReceivedMessage(messageId)
{
    const context = getContext();
    const message = context.chat[messageId - 1];
    const character = context.characters[context.characterId];
    character.description = character.data.description;
    if(message && message.mes == '-roll')
    {
        setTimeout(async () => {
            await doMesCut(messageId - 1, 1);
        }, 10);
    }
	return true;
}