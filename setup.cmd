:: create docker network for containers
docker network create elitr

:: execute mongo-db docker
docker pull mongo
docker run  ^
            --network elitr ^
            -e MONGO_INITDB_ROOT_USERNAME=mongoadmin ^
            -e MONGO_INITDB_ROOT_PASSWORD=password ^
            -v C:\Daten\elitr\mongo:/data/db ^
            -p 27017:27017 --name elitr-mongo -d --restart always mongo

:: execute web docker
docker pull ghcr.io/jimmylevell/annotator:latest
docker run ^
            --network elitr ^
            --env-file C:\Daten\git\annotator\.env ^
            -v C:\Daten\elitr\annotationFiles:/usr/src/app/externalFiles ^
            -p 10000:10000 --name elitr-web -d --restart always ghcr.io/jimmylevell/annotator:latest


:: commands for managing docker container
docker rm -f elitr-mongo
docker exec -it elitr-mongo /bin/bash

:: for deployig the service within a docker swarm
docker stack deploy --compose-file docker-compose.yml elitr
docker stack services elitr

:: or by using the compose file
docker-compose up
docker-compose down