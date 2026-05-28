import { supabase } from "../lib/supabaseClient";

let saveTimeout = null

const saveBoard = (editor, boardId) => {
    clearTimeout(saveTimeout)

    saveTimeout = setTimeout(async () => {

        const snapshot = JSON.stringify(editor.getSnapshot())
        const {data, error} = await supabase
        .from("whiteboards")
        .update({canvas_data: snapshot})
        .eq('id', boardId)

        console.log("hellobiii")
    }, 1000);
}

export default saveBoard