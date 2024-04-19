const mongoose = require("mongoose");
const { api_key } = require("../secret");
const { Schema } = mongoose;
const db =
  "mongodb+srv://kalevaibhav2903:dPmO7gc2TAEn6CzD@cluster0.n8syznb.mongodb.net/db";
const database = mongoose.connect(db);

const coin = new Schema({
  address: String,
  data: [
    {
      blockNumber: String,
      blockHash: String,
      timeStamp: String,
      hash: String,
      nonce: String,
      transactionIndex: String,
      from: String,
      to: String,
      value: String,
      gas: String,
      gasPrice: String,
      input: String,
      methodId: String,
      functionName: String,
      contractAddress: String,
      cumulativeGasUsed: String,
      txreceipt_status: String,
      gasUsed: String,
      confirmations: String,
      isError: String,
    },
  ],
});

const Tran = mongoose.model("Tran", coin);
async function v(address) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&api_key=${
    process.env.api_key | api_key
  }`;
  const data = await fetch(url, { method: "GET" });
  const res = await data.json();

  if (res && res.result) {
    const trans = new Tran({ address: address, data: res.result });
    trans.save().then(() => console.log("done"));
    return res.result;
  }
  return [];
}

async function getHandler(address) {
  const res = await Tran.findOne({ address: address });
  return res?.data || v(address);
}
getHandler("0xce94e5621a5f7068253c42558c147480f38b5e0d").then((data) => {
  // console.log(data);
});

module.exports = { v, getHandler, Tran };
