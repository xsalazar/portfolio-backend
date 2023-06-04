const sharp = require("sharp");
var fs = require("fs");

// This helper function will convert input files into compressed webp images
// This is necessary to bypass the 10MB limit in AWS API Gateway
async function convert() {
  var inputFileNames = fs.readdirSync(`./input`);
  for (var i = 0; i < inputFileNames.length; i++) {
    const inputFileName = inputFileNames[i];
    const outputFileName = `./output/${inputFileName.split(".")[0]}.webp`;

    console.log(`Processing: ${inputFileName}`);
    await sharp(`./input/${inputFileName}`).webp().toFile(outputFileName);
  }
}

convert();
