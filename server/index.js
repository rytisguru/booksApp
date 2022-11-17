import express from "express";
import { readFileSync, writeFile, unlinkSync, readdirSync, existsSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient()

// GET RID OF UNUSED IMAGES //
const allImages = readdirSync('images')
async function getImages() {
  await prisma.books.findMany({
    select: { image: true }
  }).then(response => {
    let imagesInDB = []
    response.map(images => imagesInDB.push(images.image))

    allImages.map(image => {
      if (!imagesInDB.includes(image)) {
        try {
          unlinkSync('images/' + image)
        } catch (error) {
          console.log(error)
        }
      }
    })
  })
}
getImages()
///////////////////////////

const app = express();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

const httpServer = createServer({
  key: readFileSync("./cert/CA/localhost/localhost.decrypted.key"),
  cert: readFileSync("./cert/CA/localhost/localhost.crt"),
  requestCert: false,
  rejectUnauthorized: false
}, app);
const PORT = process.env.PORT;

const socketIO = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL
  }
});

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('saveImage', ({ image }) => {
    var base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

    var fileName = "book_" + Math.floor(Math.random() * 10000) + "_" + Math.floor(Math.random() * 100000) + ".jpeg";
    writeFile("images/" + fileName, base64Data, 'base64', function (err) {
      console.log(err);
    });
    socketIO.emit('setImage', { fileName: fileName })
  })

  socket.on("saveData", async ({ data }) => {
    const Book = await prisma.books.create({
      data: {
        title: data.title,
        author: data.author,
        pages: parseInt(data.pages),
        year: parseInt(data.year),
        price: parseFloat(data.price),
        image: data.image,
        section: data.section,
        shelf: parseInt(data.shelf)
      }
    }).then(book => {
      socket.emit("saveData", { id: book.id, status: true, error: "" })
    }).catch((err) => {
      socket.emit("saveData", { id: null, status: false, error: err })
    })
  })

  socket.on("updateData", async ({ data }) => {
    const updateBook = await prisma.books.update({
      where: { id: data.id },
      data: {
        title: data.title,
        author: data.author,
        pages: parseInt(data.pages),
        year: parseInt(data.year),
        price: parseFloat(data.price),
        image: data.image,
        section: data.section,
        shelf: parseInt(data.shelf)
      }
    }).then(book => {
      socket.emit("updateData", { status: true, error: "" })
    }).catch((err) => {
      socket.emit("updateData", { status: false, error: err })
    })
  })

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/getAuthors', async (req, res) => {
  const authors = await prisma.books.findMany({
    select: { author: true }
  })
  const uniqueAuthors = []
  authors.map(authors => {
    if (!uniqueAuthors.includes(authors.author)) {
      uniqueAuthors.push(authors.author)
    }
  })
  res.json(uniqueAuthors.sort((a, b) => a.localeCompare(b)))
}) 

app.get('/getBooks', async (req, res) => {
  const books = await prisma.books.findMany({
    select: {
      id: true,
      title: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  const booksArray = [];
  books.map(book => { 
    booksArray.push({ id: book.id, name: book.title })
  })
  res.json(booksArray);
})

app.get('/getBook/:book', async (req, res) => {
  const book = await prisma.books.findFirst({
    where: { id: req.params.book }
  })
  res.json(book);
})

app.get('/images/:image', (req, res) => {
  try {
    const path = __dirname + '/images/' + req.params.image
    if (existsSync(path)) {
      res.sendFile(path)
    } else {
      res.json(null)
    }
  } catch (error) {
    console.log(error)
  }
})

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});