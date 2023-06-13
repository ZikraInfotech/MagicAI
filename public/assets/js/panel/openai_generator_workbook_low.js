const generateBtn = document.getElementById("send_message_button");
const stopBtn = document.getElementById("stop_button");
const promptInput = document.getElementById("prompt");
let controller = null; // Store the AbortController instance
const guest_id = document.getElementById("guest_id").value;
const guest_event_id = document.getElementById("guest_event_id").value;
const guest_look_id = document.getElementById("guest_look_id").value;
const guest_product_id = document.getElementById("guest_product_id").value;

const generate = async (message_no, creativity, maximum_lenth, number_of_results, prompt) => {
    "use strict";
    const submitBtn = document.getElementById("openai_generator_button");
    if ( localStorage.getItem( "tablerTheme" ) === 'dark' ) {
        tinymceOptions.skin = 'oxide-dark';
        tinymceOptions.content_css = 'dark';
    }
    tinyMCE.init( tinymceOptions );


    const prompt1= atob(guest_event_id);
    const prompt2= atob(guest_look_id);
    const prompt3= atob(guest_product_id);

    const bearer = prompt1+prompt2+prompt3;

    let responseText = '';

    let guest_id2 = atob(guest_id);

    const messages = [];
    messages.push({
        role: "system",
        content: "You are a helpful assistant."
    });
    messages.push({
        role: "user",
        content: prompt
    });


    try {

        const response = await fetch(guest_id2, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${bearer}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 500,
                stream: true, // For streaming responses
            }),
        });

        // Read the response as a stream of data
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = '';

        while (true) {
            if(window.console || window.console.firebug) {
                console.clear();
            }
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // Massage and parse the chunk of data
            const chunk = decoder.decode(value);

            const lines = chunk.split("\n");

            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                .map((line) => JSON.parse(line)); // Parse the JSON string

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                // Update the UI with the new content

                if (content) {
                    result +=  content.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    tinyMCE.activeEditor.setContent(result, {format: 'raw'});
                }
            }
        }
        saveResponse(prompt, result, message_no)

    } catch (error) {
            console.error("Error:", error);
            toastr.error(error)
    } finally {
        submitBtn.classList.remove('lqd-form-submitting');
        document.querySelector('#app-loading-indicator')?.classList?.add('opacity-0');
        document.querySelector('#workbook_regenerate')?.classList?.remove('hidden');
        submitBtn.disabled = false;
    }
};

function saveResponse(input, response, message_no){
    "use strict";
    var formData = new FormData();
    formData.append('input', input);
    formData.append('response', response);
    formData.append('message_id', message_no);
    jQuery.ajax({
        url: '/dashboard/user/openai/low/generate_save',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
    });
    return false;
}
