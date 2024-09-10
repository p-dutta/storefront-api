
# AS Store

This repository has the `docker-compose.yml` file that runs the AS Store by building and spinning up all the dependent containers/services.

The `as_store_api` directory has the backend application in it, written in `Express.js`.

Expectation is to add the frontend application in `as_store_front` directory and update the `docker-compose.yml` file accordingly.


## Steps to run and build:

- First and foremost, please make sure you have `docker` installed.


- Clone the AS Store repo from [here](https://gitlab.com/plabon_dutta/as_store):

```console
$ git clone https://gitlab.com/plabon_dutta/as_store.git
```


- Navigate to the `as_store_api` submodule:

```console
$ cd as_store_api/
```

- Initialize and update the submodule:

```console
$ git submodule init
$ git submodule update
```

- Get back to the root directory:

```console
$ cd ..
```

- Run services and spin everything up with `docker-compose`:

```console
$ docker compose up --build -d
```

- Or, for running a specific service/container (for example, `api`):

```console
$ docker compose up --build api -d
```

- If you don't want to rebuild:

```console
$ docker compose up
$ docker compose up api
```

### Stopping a container

- When you execute `docker compose stop`, the running containers are stopped and they are not removed.

- When you execute `docker compose down`, the running containers are stopped and also removed. Also the networks, volumes and images created by docker compose up are removed.

Based on the above, you can decide what suits you the most.

```console
$ docker compose stop
$ docker compose stop api
```



If you want your local code to be reflected on the running container right away, change `NODE_ENV: production` to `NODE_ENV: development` in `services->api->environment` section of the `docker-compose.yml` file.
