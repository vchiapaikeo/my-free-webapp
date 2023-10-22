const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const db = require("./db");
const redisCache = require("./cache");
const gcs = require("./gcs");

const jsonParser = bodyParser.json();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.get("/api/v1/items", async (req, res) => {
const results = [
    { col1: 10, col2: 15, col3: 20 },
    { col1: 12, col2: 13, col3: 14 },
  ];
  res.send({ results: results });
});

app.post("/api/v1/item/image/upload", upload.array("photos", 2), async (req, res) => {
  const uris = [];
  const gcsPromises = req.files.map((file) => {
    const path = `${req.body.id}/${file.originalname}`;
    uris.push(encodeURI(`/api/v1/item/image/${path}`));
    return gcs.save(path, file.buffer);
  });

  // Save to GCS and send URIs to db
  await Promise.all([...gcsPromises, db.updateItemWithImageURIs(req.body.id, uris)]);

  res.send({ uris });
});

app.get("/api/v1/item/image/:itemID/:filename", async (req, res) => {
  const path = `${req.params.itemID}/${req.params.filename}`;

  const cached = await redisCache.getBuffer(path);
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  if (cached !== null && cached !== undefined) {
    // Found the object in cache
    const file = nodeStream.Readable.from(cached);
    file.pipe(res);
  } else {
    // No cache, read from GCS
    const bufferArr = [];
    const bucket = gcs.getBucket();
    const stream = bucket.file(path).createReadStream();
    stream.on('error', (err) => {
      console.log('error reading stream', err);
      res.end();
    });
    stream.on('data', (data) => {
      bufferArr.push(data);
      res.write(data);
    });
    stream.on('end', () => {
      redisCache.setValue(path, Buffer.concat(bufferArr));
      res.end();
    });
  }
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

module.exports = app;
