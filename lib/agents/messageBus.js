export class MessageBus {
  constructor() {
    this.messages = [];
  }

  send(agent, content, refs = []) {
    const msg = {
      id: crypto.randomUUID(),
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
}
