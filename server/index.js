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

    var fileName = "book_" + Math.floor(Math.random() * 10000) + ".jpeg";
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
        pages: JSON.parse(data.pages),
        year: JSON.parse(data.year),
        price: JSON.parse(data.price),
        image: data.image,
        section: data.section,
        shelf: data.shelf
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
        pages: JSON.parse(data.pages),
        year: JSON.parse(data.year),
        price: JSON.parse(data.price),
        image: data.image,
        section: data.section,
        shelf: data.shelf
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

app.get('/getLatestRow', async (req, res) => {
  const latestRow = await prisma.books.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 1
  })
  res.json(latestRow)
})

app.get('/prevBook/:cursor', async (req, res) => {
  const book = await prisma.books.findMany({
    take: -1,
    skip: 1,
    cursor: {
      id: req.params.cursor,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  if (book.length !== 0) {
    return res.json(book)
  }
  res.json(null)
});

app.get('/nextBook/:cursor', async (req, res) => {
  const book = await prisma.books.findMany({
    take: 1,
    skip: 1,
    cursor: {
      id: req.params.cursor,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  if (book.length !== 0) {
    return res.json(book)
  }
  res.json(null)
});

app.get('/images/:image', (req, res) => {
  try {
    const path = __dirname + '/images/' + req.params.image
    if(existsSync(path)){
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