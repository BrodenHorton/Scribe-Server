import fs from "fs";
import express from "express";
import { SpeechBlock } from "./SpeechBlock.js";
import { Speaker } from "./Speaker.js";

const app = express();
const port = 3000;
const masterKey = '4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT';
const assemblyAiApiKey = 'b87610c4a70644f6a3abfc216e9a7204';

var micCount = 1;
var speakers = [];

function speechBlockPrintInterval() {
  setInterval(() => {
    console.log("\n==== Speech Blocks ====");
    console.log(`Number of Speakers: ${speakers.length}`);
    var speakerCount = 1;
    speakers.filter((element) => element instanceof Speaker)
      .forEach(speaker => {
        console.log(`Number of Speech Blocks for Speaker ${speaker.inputDeviceIndex}: ${speaker.speechBlocks.length}`);
          var speechBlockCount = 1;
          speaker.speechBlocks.filter((element => element instanceof SpeechBlock))
            .forEach(speechBlock => {
              console.log(`Block: ${speechBlockCount}`);
              console.log(`${speechBlock.text}\n`);
              speechBlockCount++;
            })
          speakerCount++;
      });
  }, 10000);
}

for(var i = 0; i < micCount; i++) {
  var speaker = new Speaker(assemblyAiApiKey, i.toString());
  speakers.push(speaker);
  speaker.run();
}

speechBlockPrintInterval();

app.get(`/all`, (req, res) => {
  res.json(speakers);
});

app.listen(port, () => {
    console.log(`Successfully started server on port ${port}.`);
});