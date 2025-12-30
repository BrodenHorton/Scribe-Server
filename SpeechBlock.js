export { SpeechBlock };

class SpeechBlock {
    text = "";
    when = "";
    isFinalized = false;
    
    constructor(when) {
        this.when = when;
    }
}