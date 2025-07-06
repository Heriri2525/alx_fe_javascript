// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" }
];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// ✅ Required function: displayRandomQuote
function displayRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerText = `"${quote.text}" — ${quote.category}`;
}

// ✅ Required function: addQuote
function addQuote() {
  const quoteTextInput = document.getElementById("newQuoteText");
  const quoteCategoryInput = document.getElementById("newQuoteCategory");

  const quoteText = quoteTextInput.value.trim();
  const quoteCategory = quoteCategoryInput.value.trim();

  if (quoteText && quoteCategory) {
    const newQuote = {
      text: quoteText,
      category: quoteCategory
    };

    // Add new quote to the array
    quotes.push(newQuote);

    // Update the display to show the new quote
    displayRandomQuote();

    // Clear input fields
    quoteTextInput.value = "";
    quoteCategoryInput.value = "";
  } else {
    alert("Please fill in both quote text and category.");
  }
}

// ✅ Add event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
