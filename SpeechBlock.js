export { SpeechBlock };

class SpeechBlock {
    uuid = crypto.randomUUID();
    text = "";
    dtmLastUpdate = new Date();
    isFinalized = false;
    
    constructor() {}

    updateSpeechBlock(text) {
        this.text = text;
        this.dtmLastUpdate = new Date();
    }
}