const express = require("express");
const mongoose = require("mongoose");
const { getHandler } = require("./model/transactionFetch");
const Price = require("./model/EthPrice");
const { Tran } = require("./model/transactionFetch");
const app = express();
const axios = require("axios");

const PORT = process.env.port || 5000;
const MONGO_URI =
  "mongodb+srv://kalevaibhav2903:dPmO7gc2TAEn6CzD@cluster0.n8syznb.mongodb.net/db";

app.get("/", async (req, res) => {
  res.send("Backend is working fine");
});

app.get("/getTransactions/:address", async (req, res) => {
  const address = req.params.address;
  const transactionData = await getHandler(address);
  res.send(transactionData || {});
});

app.get("/api/userBalance", async (req, res) => {
  try {
    const userAddress = req.query.address;

    // Fetch transactions associated with the user's address
    const userTransactions = await Tran.findOne({ address: userAddress });
    // console.log(userTransactions);

    let balance = 0;

    userTransactions.data.forEach((transaction) => {
      if (transaction.from === userAddress) {
        balance -= parseFloat(transaction.value);
      }
      if (transaction.to === userAddress) {
        balance += parseFloat(transaction.value);
      }
    });

    // Fetch the current price of ether
    const etherPrice = await Price.findOne({ id: 1 }); // Assuming you have a single price document with id: 1
    const currentPrice = etherPrice ? etherPrice.currPrice : null;

    // Return the user's current balance and the current price of ether
    res.json({ balance, currentPrice });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function updateEthPrice() {
  let response;
  try {
    response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );
    console.log("Data:", response.data);
    const count = await Price.countDocuments();
    if (count === 0) {
      const price = new Price({ currPrice: response.data.ethereum.inr });
      await price.save();
      console.log("Price saved Successfully");
    } else {
      let OldPrice;
      OldPrice = await Price.findOne({ id: 1 });
      OldPrice.currPrice = response.data.ethereum.inr;
      await OldPrice.save();
      console.log("Price updated Successfully");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
updateEthPrice();
setInterval(updateEthPrice, 10 * 60 * 1000);

// starting and setting up the server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Mongodb Database");
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
