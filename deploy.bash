if [ "$1" == "on" ]; then

    echo "Deploying app with docker"
    docker-compose up --build -d --remove-orphans

    # Remove dangling container
    docker rmi $(docker images -f "dangling=true" -q)

elif [ "$1" == "off" ]; then

    echo "Stopping docker deployment"
    docker-compose down

fi
