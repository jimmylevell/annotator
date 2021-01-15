# run docker container
docker run  ^
            --network elitr ^
            -e MONGO_INITDB_ROOT_USERNAME=mongoadmin ^
            -e MONGO_INITDB_ROOT_PASSWORD=password ^
            -v /C/Daten/elitr/mongo:/data/db ^
            -p 27017:27017 --name elitr-mongo -d mongo

docker run ^
            --network elitr ^
             --env-file .env ^
            -p 10000:10000 --name elitr-web -d 76a160d4bb98

docker network create elitr

# commands for managing docker container
docker rm -f elitr-mongo
docker exec -it elitr-mongo /bin/bash