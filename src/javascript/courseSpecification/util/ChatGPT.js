var systemMessage = {
    role: "system",
    content: "you are NCAAA bot, your job is to help instructors complete their reports by providing recommendations to student performance. Your responses should not be more then 50 words. There won't get any human interaction, rather you will be supplied with other form of data as JSON and you'll have to respond back accordingly."
}

/**
 * 
 * @param {JSON} p_objData 
 * @returns {String}
 */
export async function sendTotGPT(p_objData){

    var messages = []

    const userMessage = {
        role: 'user',
        content: JSON.stringify(p_objData)
    }

    messages.push(systemMessage)
    messages.push(userMessage)

    var options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${'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'}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
        }),
    }

    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        options
    );

    const data = await response.json()

    /**@type {String} */
    const messageContent = data.choices[0].message.content

    const lines = messageContent.split('\n')

    return lines
}