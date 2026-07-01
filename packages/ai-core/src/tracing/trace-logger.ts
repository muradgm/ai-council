export interface TraceEvent { type: string; message: string; at: string; }
export class TraceLogger { private events: TraceEvent[] = []; log(type: string, message: string) { this.events.push({ type, message, at: new Date().toISOString() }); } list() { return this.events; } }
