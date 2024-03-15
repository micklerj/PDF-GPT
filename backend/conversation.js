const { MongoClient, ObjectId } = require("mongodb");
const { BufferMemory } = require("langchain/memory");
const { ChatOpenAI } = require("@langchain/openai");
const { ConversationChain } = require("langchain/chains");
const { MongoDBChatMessageHistory } = require("@langchain/mongodb");



const convo = async (collection, sessionId) => {
  //const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
  //await client.connect();
  //const collection = client.db("pdf-gptDB").collection("chat-history");

  // generate a new sessionId string
  // const sessionId = new ObjectId().toString();

  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });

  const model = new ChatOpenAI({});

  const chain = new ConversationChain({ llm: model, memory });

  const res1 = await chain.call({ input: "what was the last question I asked you?" });
  console.log({ res1 });  
}


const clearHistory = async (collection, sessionId) => {
  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });
  await memory.chatHistory.clear();
}

const printHistory = async (collection, sessionId) => {
  const memory = new BufferMemory({
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });
  console.log(await memory.chatHistory.getMessages());
}

module.exports = {convo, clearHistory, printHistory};