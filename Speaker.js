import { AssemblyAI } from "assemblyai";
import { Readable } from "stream";
import recorder from "node-record-lpcm16";
import { SpeechBlock } from "./SpeechBlock.js";
export { Speaker };

class Speaker {
    inputDeviceIndex = 0;
    speechBlocks = []
    
    constructor(inputDeviceIndex) {
        this.inputDeviceIndex = inputDeviceIndex;
    }

    async run(assemblyAiApiKey) {
        const client = new AssemblyAI({
            // Replace with your chosen API key, this is the "default" account api key
            apiKey: assemblyAiApiKey
        });

        const CONNECTION_PARAMS = {
            sampleRate: 16000,
            formatTurns: true
        }

        const transcriber = client.streaming.transcriber(CONNECTION_PARAMS);

        transcriber.on("open", ({ id }) => {
            console.log(`Session opened with ID: ${id}`);
        });

        transcriber.on("error", (error) => {
            console.error("Error:", error);
        });

        transcriber.on("close", (code, reason) =>
            console.log("Session closed:", code, reason)
        );

        transcriber.on("turn", (turn) => {
            if (!turn.transcript) {
            return;
            }

            if(this.speechBlocks.length == 0 || this.speechBlocks[this.speechBlocks.length - 1].isFinalized) {
            this.speechBlocks.push(new SpeechBlock(""));
            }
            
            if(turn.end_of_turn && turn.turn_is_formatted) {
            console.log("End of Turn:", turn.transcript);
            this.speechBlocks[this.speechBlocks.length - 1].text = turn.transcript;
            this.speechBlocks[this.speechBlocks.length - 1].isFinalized = true;
            }
            else {
            console.log("Turn:", turn.transcript);
            this.speechBlocks[this.speechBlocks.length - 1].text = turn.transcript;
            }
        });

        try {
            console.log("Connecting to streaming transcript service");

            await transcriber.connect();

            console.log("Starting recording");

            const recording = recorder.record({
                inputDeviceIndex: this.inputDeviceIndex,
                channels: 1,
                sampleRate: CONNECTION_PARAMS.sampleRate,
                audioType: "wav", // Linear PCM
            });

            Readable.toWeb(recording.stream()).pipeTo(transcriber.stream());

            // Stop recording and close connection using Ctrl-C.
            process.on("SIGINT", async function () {
            console.log();
            console.log("Stopping recording");
            recording.stop();

            console.log("Closing streaming transcript connection");
            await transcriber.close();

            process.exit();
            });

            recording.start();
        } catch (error) {
            console.error(error);
        }
    };
}