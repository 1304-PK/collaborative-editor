import { supabase } from "../lib/supabaseClient";

let saveTimeout = null

const saveBoard = (editor, boardId, setSaveStatus) => {
    clearTimeout(saveTimeout)
    setSaveStatus(true)
    saveTimeout = setTimeout(async () => {
        const snapshot = JSON.stringify(editor.getSnapshot())
        const {data, error} = await supabase
        .from("whiteboards")
        .update({canvas_data: snapshot})
        .eq('id', boardId)

        console.log("hellobiii")
        setSaveStatus(false)
    }, 1000);
}

export default saveBoard