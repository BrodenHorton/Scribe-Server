export { SpeechLine };

class SpeechLine {
    uuid = crypto.randomUUID();
    text = "";
    created = new Date()
    dtmLastUpdate = new Date();
    isFinalized = false;
    
    constructor() {}

    updateSpeechBlock(text) {
        this.text = text;
        this.dtmLastUpdate = new Date();
    }
}