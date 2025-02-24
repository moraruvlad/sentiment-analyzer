// Load environment variables from .env file
require('dotenv').config();

const apiKey = process.env.API_KEY;

async function analyzeSentiment(text) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Detail: ${errorText}`);
    }
    const result = await response.json();
    console.log("API Response:", result);
    if (!result || !Array.isArray(result)) {
      throw new Error("Unexpected API response format");
    }
    const sentiments = Array.isArray(result[0]) ? result[0] : result;
    if (!sentiments.length) {
      throw new Error("No sentiment data returned");
    }
    const highestScore = sentiments.reduce((max, current) =>
      current.score > max.score ? current : max
    );
    return `${highestScore.label} (${(highestScore.score * 100).toFixed(2)}%)`;
  }
  
  document.getElementById("submit").addEventListener("click", async () => {
    const text = document.getElementById("comment").value;
    if (text.trim() === "") {
      document.getElementById("result").innerText = "Please enter a comment!";
      return;
    }
    document.getElementById("result").innerText = "Analyzing...";
    try {
      const sentiment = await analyzeSentiment(text);
      document.getElementById("result").innerText = `Sentiment: ${sentiment}`;
      // Add to history
      const historyList = document.getElementById("history");
      const listItem = document.createElement("li");
      listItem.textContent = `${text} - ${sentiment}`;
      historyList.insertBefore(listItem, historyList.firstChild); // Newest first
    } catch (error) {
      document.getElementById("result").innerText = `Error: ${error.message}`;
      console.error("Error:", error);
    }
  });
  
  document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("comment").value = "";
    document.getElementById("result").innerText = "";
  });