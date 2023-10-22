const { Storage } = require("@google-cloud/storage");

const BUCKET = "my-bucket";
const storage = new Storage();

async function save(path, buffer) {
  const file = storage.bucket(BUCKET).file(path);
  const options = {
    metadata: {
      cacheControl: "public, max-age=86400",
    },
  };
  file.save(buffer, options, (err) => {
    if (!err) {
      console.log("Completed upload");
    } else {
      console.error("error " + err);
    }
  });
}

async function deletePrefixPath(prefix) {
  const bucket = storage.bucket(BUCKET);
  const [files] = await bucket.getFiles({ prefix: `${prefix}/` });
  await Promise.allSettled(files.map((file) => file.delete({ ignoreNotFound: true })));
}

function getBucket() {
  return storage.bucket(BUCKET);
}

module.exports = {
  getBucket,
  save,
  deletePrefixPath,
};
