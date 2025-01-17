const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    } else {
        return res.status(404).json({message: "Username or password not provided!"});
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

const fetchBooks = (isbn = null) => {
    if (isbn) {
        return books[isbn];  // Fetch the specific book by ISBN
    } else {
        return books;  // Return all books if no ISBN is provided
    }
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        return res.status(200).json({"message": await fetchBooks()});
    } catch {
        return res.status(500).send("Failed to fetch books.")
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    return res.status(200).json({message: await fetchBooks(isbn)});
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const gottenBooks = await fetchBooks();
  for (let key in gottenBooks) {
    if (gottenBooks[key].author === author) {
        return res.status(200).json({message: gottenBooks[key]});
    }
  }
  return res.status(200).json({message: `No book by ${author} in database`});
  
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const gottenBooks = await fetchBooks();

  for (let key in gottenBooks) {
    if (gottenBooks[key].title === title) {
        const booksByTitle = gottenBooks[key];
        return res.status(200).json({message: booksByTitle});
    }
  }
  return res.status(200).json({message: `No book by ${title} in database`});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json({message: books[isbn].reviews});
});

module.exports.general = public_users;
