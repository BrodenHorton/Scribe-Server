import fs from "fs";
import express from "express";
import { AssemblyAI } from "assemblyai";
import { Readable } from "stream";
import recorder from "node-record-lpcm16";
import SpeechBlock from "./SpeechBlock.js";

const app = express();
const port = 3000;
const masterKey = '4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT';
const assemblyAiApiKey = 'b87610c4a70644f6a3abfc216e9a7204';

var speechBlocks = [];

const run = async () => {
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

    if(speechBlocks.length == 0 || speechBlocks[speechBlocks.length - 1].isFinalized) {
      speechBlocks.push(new SpeechBlock());
    }
    
    if(turn.end_of_turn && turn.turn_is_formatted) {
      console.log("End of Turn:", turn.transcript);
      speechBlocks[speechBlocks.length - 1].text = turn.transcript;
      speechBlocks[speechBlocks.length - 1].isFinalized = true;
    }
    else {
      console.log("Turn:", turn.transcript);
      speechBlocks[speechBlocks.length - 1].text = turn.transcript;
    }
  });

  try {
    console.log("Connecting to streaming transcript service");

    await transcriber.connect();

    console.log("Starting recording");

    const recording = recorder.record({
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

run();

// Testing
setInterval(() => {
  console.log("\n==== Speech Blocks ====");
      console.log(`Number of Speech Blocks: ${speechBlocks.length}`);
      var count = 1;
      speechBlocks
        .forEach(element => {
          if(element instanceof SpeechBlock) {
            console.log(`Block: ${count}`);
            console.log(`${element.text}\n`);
            count++;
          }
        });
}, 15000);



app.get(`/all`, (req, res) => {
  res.json(speechBlocks);
});

app.listen(port, () => {
    console.log(`Successfully started server on port ${port}.`);
});