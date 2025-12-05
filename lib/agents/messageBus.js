export class MessageBus {
  constructor() {
    this.messages = [];
  }

  send(agent, content, refs = []) {
    const msg = {
      id: crypto.randomUUID(),
      type: "message",
      agent,
      content,
      references: refs,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    return msg;
  }

  getAll() {
    return [...this.messages];
  }

  filterByAgent(agent) {
    return this.messages.filter((m) => m.agent === agent);
  }

  last(n = 1) {
    return this.messages.slice(-n);
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
