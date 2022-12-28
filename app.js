const express = require('express');
const multer = require('multer');
const textract = require('textract');
const extractor = require('keyword-extractor');
const natural = require('natural');

const app = express();

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/extract-text', upload.single('document'), (req, res) => {
  // Extract text from the uploaded document
  textract.fromFileWithPath(req.file.path, (error, alltext) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
    const strkeywords = extractor.extract(alltext, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
        });        
      res.json({ text: alltext, keywords: strkeywords });
    }
  });
});

app.post('/extract-textnlp', upload.single('document'), (req, res) => {
    // Extract text from the uploaded document
    textract.fromFileWithPath(req.file.path, (error, alltext) => {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(alltext);

        // Use the natural.TfIdf class to calculate the tf-idf scores for each word
        const tfidf = new natural.TfIdf();
        tfidf.addDocument(tokens);
      
        // Get the top 5 keywords with the highest tf-idf scores
        const  strkeywords = tfidf.listTerms(5).map(item => item.term);
      
        res.json({ text: alltext, keywords: strkeywords });
      }
    });
  });


app.listen(5000, () => {
  console.log('Text extraction API listening on port 5000');
});