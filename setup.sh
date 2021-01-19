# create docker network
docker network create elitr

# execute mongo-db docker
docker pull mongo
docker run  \
            --network elitr \
            -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
            -e MONGO_INITDB_ROOT_PASSWORD=password \
            -v /home/james/elitr/mongo:/data/db \
            -p 27017:27017 --name elitr-mongo -d --restart always mongo

# execute web docker
docker pull ghcr.io/jimmylevell/annotator:latest
docker run \
            --network elitr \
            --env-file /home/james/elitr/annotator/.env \
            -v /home/james/elitr/annotationFiles/annotations_en.csv:/usr/src/app/public/annotations_en.csv \
            -v /home/james/elitr/annotationFiles/annotations_cz.csv:/usr/src/app/public/annotations_cz.csv \
            -p 10000:10000 --name elitr-web -d --restart always ghcr.io/jimmylevell/annotator:latest

# commands for managing docker container
docker rm -f elitr-mongo
docker exec -it elitr-mongo /bin/bash