const sendMessage = async () => {
  setMessage('')  // Clear the input field
  setMessages((messages) => [
    ...messages,
    { role: 'user', content: message },  // Add the user's message to the chat
    { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
  ])

  // Send the message to the server
  const response = fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([...messages, { role: 'user', content: message }]),
  }).then(async (res) => {
    const reader = res.body.getReader()  // Get a reader to read the response body
    const decoder = new TextDecoder()  // Create a decoder to decode the response text

    let result = ''
    // Function to process the text from the response
    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result
      }
      const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
        let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
        ]
      })
      return reader.read().then(processText)  // Continue reading the next chunk of the response
    })
  })
}
