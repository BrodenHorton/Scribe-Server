export { SpeechBlock };

class SpeechBlock {
    uuid = crypto.randomUUID();
    text = "";
    dtmLastUpdate = new Date();
    isFinalized = false;
    
    constructor() {}
}