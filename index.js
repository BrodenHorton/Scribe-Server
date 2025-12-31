import express from "express";
import { SpeechBlock } from "./SpeechBlock.js";
import { Speaker } from "./Speaker.js";

const app = express();
const port = 3000;
const masterKey = '4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT';
const assemblyAiApiKey = 'b87610c4a70644f6a3abfc216e9a7204';

var micCount = 2;
var speakers = [];

// for(var i = 0; i < micCount; i++) {
//   var speaker = new Speaker(i);
//   speakers.push(speaker);
//   speaker.run(assemblyAiApiKey);
// }

//speechBlockPrintInterval();

populateTestData();

function populateTestData() {
  var speaker1 = new Speaker(0);
  var speechBlock1 = new SpeechBlock();
  speechBlock1.updateSpeechBlock("Hello, my name is Miku.");
  speaker1.speechBlocks.push(speechBlock1);
  speakers.push(speaker1);
  var speaker2 = new Speaker(1);
  var speechBlock2 = new SpeechBlock();
  speechBlock2.updateSpeechBlock("It's nice to meet you Miku.");
  speaker2.speechBlocks.push(speechBlock2);
  speakers.push(speaker2);
}

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

app.get(`/all`, (req, res) => {
  var newSpeechBlocks = [];
  for(var i = 0; i < speakers.length; i++) {
    for(var j = 0; j < speakers[i].speechBlocks.length; j++) {
      newSpeechBlocks.push({
        speaker: speakers[i].inputDeviceIndex,
        blockUuid: speakers[i].speechBlocks[j].uuid,
        text: speakers[i].speechBlocks[j].text
      });
    }
  }

  const result = {
    date: Date(),
    speechBlocks: newSpeechBlocks
  };

  res.json(result);
});

app.get(`/after`, (req, res) => {
  const dtmLastRequested = req.query.lastRequested;
  console.log(`dtmLastRequested: ${dtmLastRequested}`);
  var newSpeechBlocks = [];
  for(var i = 0; i < speakers.length; i++) {
    for(var j = speakers[i].speechBlocks.length - 1; j >= 0; j--) {
      if(speakers[i].speechBlocks[j].dtmLastUpdate < dtmLastRequested) {
        break;
      }
      newSpeechBlocks.push({
        speaker: speakers[i].inputDeviceIndex,
        blockUuid: speakers[i].speechBlocks[j].uuid,
        text: speakers[i].speechBlocks[j].text
      });
    }
  }

  const result = {
    date: Date(),
    speechBlocks: newSpeechBlocks
  };

  res.json(result);
});

app.listen(port, () => {
    console.log(`Successfully started server on port ${port}.`);
});