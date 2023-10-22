set -ex

rm -rf ~/development/my-free-webapp/client/build
rm -rf ~/development/my-free-webapp/api/client/build

mkdir -p ~/development/my-free-webapp/api/client/build

cd ~/development/my-free-webapp/client
npm run build

mv build/ ~/development/my-free-webapp/api/client/

cd ~/development/my-free-webapp/api
gcloud app deploy --quiet --no-cache
