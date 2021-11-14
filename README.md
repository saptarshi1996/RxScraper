## Description

Scraping data from various RX site and list them using puppeteer and cheerio. 

Tech Stack: Hapi with Typescript

Deployment: Docker

API has been documented with hapi-swagger

## Installation

Clone the repository and Install the dependencies and devDependencies.

```sh
cd rxscraper_backend
npm i
touch .env
```

Add the following keys in .env file
```sh
PORT=8081
HOST=localhost
```

Finally start the server
```sh
npm run start
```

To deploy with docker: 
Install docker and run the bash script
```sh
bash deploy.bash on
```

Visit http://localhost:8081/scraper/documentation
