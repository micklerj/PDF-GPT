const fs = require('fs');
const {RecursiveCharacterTextSplitter} = require('langchain/text_splitter');
const pdf = require('pdf-parse');

const { MongoClient, ObjectId } = require("mongodb");
const { BufferMemory } = require("langchain/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { ConversationChain } = require("langchain/chains");
const { MongoDBChatMessageHistory } = require("@langchain/mongodb");
const {HNSWLib} = require('@langchain/community/vectorstores/hnswlib');
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

const {createStuffDocumentsChain} = require('langchain/chains/combine_documents');
const {ChatPromptTemplate} = require('@langchain/core/prompts');
const {createRetrievalChain} = require('langchain/chains/retrieval');
const {createHistoryAwareRetriever} = require('langchain/chains/history_aware_retriever');
const {MessagesPlaceholder} = require('@langchain/core/prompts');



// vectorize the pdf file into a local vector store
const vectorizePDF = async (pdfname) => {
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

// generate a new sessionId string
const genSessionID = async () => {
  const sessionId = new ObjectId().toString();
  return sessionId;
}

const convo = async (collection, sessionId, user_input) => {
  //const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
  //await client.connect();
  //const collection = client.db("pdf-gptDB").collection("chat-history");


  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });

  const model = new ChatOpenAI({});

  const chain = new ConversationChain({ llm: model, memory });

  const res1 = await chain.call({ input: user_input });
  console.log({ res1 });  
}

const convo2 = async (pdfname, user_input) => {
  const model = new ChatOpenAI({});

  // vector store retriever
  const VECTOR_STORE_PATH = `./${pdfname}.index`;
  vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  const vectorStoreRetriever = vectorStore.asRetriever();

  // create search query aware of the user input and the chat history to pass to vector store
  const retrieverPrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
  ]);

  // access vector store
  const retrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever: vectorStoreRetriever,
    rephrasePrompt: retrieverPrompt,
  });

  // final prompt for the openAI model
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's questions based on the following context: {context}. If you don't know the answer, just say that you don't know, don't try to make up an answer.",
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
  ]);

  // access openAI model with the prompt
  const chain = await createStuffDocumentsChain({
    llm: model,
    prompt: prompt,
  });

  // combine the retriever chain with the openAI model chain
  const conversationChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever: retrieverChain,
  });

  const chathistory = [
    new HumanMessage("my name is Joseph"), 
    new AIMessage("Nice to meet you, Joseph! How can I assist you today?"),
    new HumanMessage("do you about the movie star wars"), 
    new AIMessage("The Star Wars franchise has become one of the most popular and iconic franchises in cinematic history. With its epic storyline, memorable characters, and stunning visual effects, Star Wars has captured the hearts of fans around the world for decades. Is there a specific aspect of the Star Wars series that you would like to delve into further?"), 
    new HumanMessage("who is the main character?"), 
    new AIMessage("In the original Star Wars trilogy, which comprises Episodes IV-VI, the main protagonist is Luke Skywalker"),
    new HumanMessage("who are some characters in the show 'death and other details'?"), 
    new AIMessage('Some of the characters in the show "Death and Other Details" include:\n' +
    '- Imogene Scott\n' +
    '- Young Anna Collier\n' +
    '- Celia Chun\n' +
    '- Keith Trubitsky\n' +
    '\n' +
    'These are some of the characters featured in the first episode of the series.'),
  ];  

  const response = await conversationChain.invoke({
    chat_history: chathistory,
    input: user_input,
  });
  console.log(response);
}


// clear a chat in the mongoDB
const clearHistory = async (collection, sessionId) => {
  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });
  await memory.chatHistory.clear();
}

// print a whole chat from the mongoDB
const printHistory = async (collection, sessionId) => {
  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });
  console.log(await memory.chatHistory.getMessages());
}

module.exports = {vectorizePDF, genSessionID, convo, convo2, clearHistory, printHistory};