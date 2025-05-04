const user_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8xIiwiaWF0IjoxNzQ2MDQ2MzY1fQ.NgtGZuzltg-WtgiDgOaLYzSQN--LJ0gr1X8jDo4I7G0"
const conversation_id = 'conversation_1'
const webhook = '253bba82-46bf-4501-ba07-3841bb3753b9'

const form = document.querySelector(".form_c")
const input_user = document.querySelector("#text_input")
const chat_container = document.querySelector(".chat_container")
const input_form = document.querySelector(".input_form")

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user_message = input_user.value;

    if (user_message) {
        try{
            add_user_message(user_message);
            input_user.value = "";

            const options_user = {
                method: 'POST',
                headers: { accept: 'application/json', 'content-type': 'application/json', "x-user-key": `${user_key}` },
                body: JSON.stringify({ payload: { type: 'text', text: `${user_message}` }, conversationId: `${conversation_id}` })
            };
            //Envia a mensagem do usuario para a conversa
            const post_user_message = await fetch(`https://chat.botpress.cloud/${webhook}/messages`, options_user);
                if(!post_user_message.ok) throw new Error ("Falha ao enviar mensagem de usuario");

            const options_bot = {
                 method: 'GET',
                 headers: { accept: 'application/json', "x-user-key": `${user_key}` } 
                };

            await new Promise (resolve => setTimeout(resolve, 9000));
            //Busca as mensagems da conversa
            const get_bot_response = await fetch(`https://chat.botpress.cloud/${webhook}/conversations/${conversation_id}/messages`, options_bot);
            if (!get_bot_response.ok) throw new Error("Falha ao receber a resposta do bot");
            
            const response = await get_bot_response.json();
            
            
            const all_messages = response.messages || [];
            
            //Pega a ultima mensagem(resposta do bot)
            const last_valid_message = all_messages.find(msg => {
                return msg.payload && (msg.payload.text || msg.payload.type === "text");
            });
            
            if (last_valid_message) {
                const bot_response_text = last_valid_message.payload.text || 
                last_valid_message.payload.message || 
                JSON.stringify(last_valid_message.payload);
              
                add_bot_message(bot_response_text);
            } else {
              console.warn("Estrutura de resposta inesperada:", response);
              add_bot_message("O bot respondeu, mas não consegui entender o formato.");
            }
        }
        catch (e){
            console.log(e);
        }
    }
})
//Adiciona a mansagem do usuario no chat
function add_user_message(message) {
    const message_div = document.createElement("div");
    message_div.className = "user_message";

    const message_p = document.createElement("p");
    message_p.textContent = message;

    message_div.appendChild(message_p);

    chat_container.insertBefore(message_div, input_form)
}
// Adiciona a mensagem do bot no chat
function add_bot_message(bot_message){
    const message_div = document.createElement("div");
    message_div.className = "bot_message";

    const message_p = document.createElement("p");
    message_p.textContent = bot_message;

    const img_span = document.createElement("span");
    const img_icon = document.createElement("img");
    img_icon.className = "furia_icon";
    img_icon.src = "https://upload.wikimedia.org/wikipedia/pt/f/f9/Furia_Esports_logo.png"

    img_span.appendChild(img_icon);

    message_div.appendChild(img_span);
    message_div.appendChild(message_p);

    chat_container.insertBefore(message_div, input_form)
}
