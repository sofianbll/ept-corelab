.PHONY: install dev start dev-client seed api-docs


install:

    npm --prefix server install

    #npm --prefix client install


dev:

    npm --prefix server run dev


start:

    npm --prefix server start


dev-client:

    npm --prefix client run dev


seed:

    npm --prefix server run seed


api-docs:

    open http://localhost:4242/api-docs
