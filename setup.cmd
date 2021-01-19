# create docker network
docker network create elitr

# execute mongo-db docker
docker pull mongo
docker run  ^
            --network elitr ^
            -e MONGO_INITDB_ROOT_USERNAME=mongoadmin ^
            -e MONGO_INITDB_ROOT_PASSWORD=password ^
            -v /C/Daten/elitr/mongo:/data/db ^
            -p 27017:27017 --name elitr-mongo -d --restart always mongo

# execute web docker
docker pull ghcr.io/jimmylevell/annotator:latest
docker run ^
            --network elitr ^
            --env-file .env ^
            -p 10000:10000 --name elitr-web -d --restart always ghcr.io/jimmylevell/annotator:latest

# commands for managing docker container
docker rm -f elitr-mongo
docker exec -it elitr-mongo /bin/bash