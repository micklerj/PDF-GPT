const {HNSWLib} = require('@langchain/community/vectorstores/hnswlib');
const {RecursiveCharacterTextSplitter} = require('langchain/text_splitter');
const pdf = require('pdf-parse');
const { ObjectId } = require("mongodb");
const { fs } = require('fs')

function getPDFNameFromPath(vectorStorePath) {
  const parts = vectorStorePath.split('/'); 
  const filename = parts.pop(); 
  const pdfName = filename.split('.').shift(); 
  return pdfName;
}

exports.vectorizePDF = async (pdfPath) => {
  const fullPdfPath = `./${pdfPath}.pdf`;
  const VECTOR_STORE_PATH = `./${pdfPath}.index`;
  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // If the vector store file exists, load it into memory
    console.log('Vector exists...');
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // If the vector store file doesn't exist, create it
    console.log('Creating vector store...');

    //const text = fs.readFileSync("murder_mystery_show.txt", "utf8");    // for .txt files
    const dataBuffer = fs.readFileSync(fullPdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    const textSplitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 1000,
      chunkOverlap: 100 
    });  
    const docs = await textSplitter.createDocuments([text]);
    // Create a vector store from the documents.
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // Save the vector store to a file
    await vectorStore.save(VECTOR_STORE_PATH);
  }  
}

exports.genSessionID = () => {
  return new ObjectId().toString();
}

exports.getPdfName = (vectorStorePath) => {
  return getPDFNameFromPath(VECTOR_STORE_PATH);
}