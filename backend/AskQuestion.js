const fs = require('fs');
//const TextLoader = require('langchain/document_loaders/fs/text');
const {RecursiveCharacterTextSplitter} = require('langchain/text_splitter');
//const MemoryVectorStore = require('langchain/vectorstores/memory');
const {OpenAIEmbeddings, ChatOpenAI} = require('@langchain/openai');
const {HNSWLib} = require('@langchain/community/vectorstores/hnswlib');
const {formatDocumentsAsString} = require('langchain/util/document');
const {
  RunnablePassthrough, 
  RunnableSequence
} = require('@langchain/core/runnables');
const {StringOutputParser} = require('@langchain/core/output_parsers');
const {
  ChatPromptTemplate, 
  HumanMessagePromptTemplate, 
  SystemMessagePromptTemplate
} = require('@langchain/core/prompts');
const pdf = require('pdf-parse');


const uploadPdf = async (pdfname) => {
  const pdfPath = `./${pdfname}.pdf`;
  const VECTOR_STORE_PATH = `./${pdfname}.index`;

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // If the vector store file exists, load it into memory
    console.log('Vector exists...');
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // If the vector store file doesn't exist, create it
    console.log('Creating vector store...');

    //const text = fs.readFileSync("murder_mystery_show.txt", "utf8");    // for .txt files
    const dataBuffer = fs.readFileSync(pdfPath);
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

const askQuestion = async (user_input, pdfname) => {
  // Initialize the LLM to use to answer the question.
  const model = new ChatOpenAI({});

  const VECTOR_STORE_PATH = `./${pdfname}.index`;
  vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());

  // Initialize a retriever wrapper around the vector store
  const vectorStoreRetriever = vectorStore.asRetriever();

  // Create a system & human prompt for the chat model
  const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  {context}`;
  const messages = [
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const prompt = ChatPromptTemplate.fromMessages(messages);

  const chain = RunnableSequence.from([
    {
      context: vectorStoreRetriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke(
    user_input
  );

  console.log({ answer });
}

module.exports = {uploadPdf, askQuestion};