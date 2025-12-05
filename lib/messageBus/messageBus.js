export class MessageBus {
  constructor() {
    this.messages = [];
  }

  send(agent, content, references = []) {
    const message = {
      id: crypto.randomUUID(),
      type: "message",
      agent,
      content,
      references,
      timestamp: Date.now(),
    };
    this.messages.push(message);
    return message;
  }

  getMessages() {
    return [...this.messages];
  }

  filter(agent) {
    return this.messages.filter((msg) => msg.agent === agent);
  }

  sendRequest(fromAgent, toAgent, question) {
    const message = {
      id: crypto.randomUUID(),
      type: "request",
      from: fromAgent,
      to: toAgent,
      question,
      timestamp: Date.now(),
    };
    this.messages.push(message);
    return message;
  }

  sendResponse(fromAgent, toAgent, answer) {
    const message = {
      id: crypto.randomUUID(),
      type: "response",
      from: fromAgent,
      to: toAgent,
      answer,
      timestamp: Date.now(),
    };
    this.messages.push(message);
    return message;
  }
}
