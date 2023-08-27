# Bluetanks Api

### Description

Bluetanks is a mobile appilcation that hepls users to easily find a grid station around them to either charge their ev cars or give back power to the grid for a fee"

---

### Bluetank Features

- Users can signup
- Create/Add EV car details
- Find nearest grid to recharge their EV cars, known as G2V
- Find nearest grid to sell power to, known as V2G
- Users can also schedule future transactions with grid
- Users can pay to grid and have account credited after selling to grid
- Payment Integration with Stripe Payments

---

### Installation Guide

- Clone the project by using `git clone`
- Run `yarn install` to install dependencies
- Run `yarn compile` script to compile the Ts files
- Run `yarn dev` script to start the server
- Visit `http://localhost:5000/` to test api

[View the API endpoint documentation](./docs/API.md)

---

### Technologies Used

- [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
- [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
- [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible JSON-like documents.
- [Mongoose ODM](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.

---

### Authors

- [Victor Nwagu](https://github.com/nwaguvictor)
- ![alt text](https://avatars.githubusercontent.com/u/57344416?s=150&u=4d1fc6b478aa46c20de562c1a972f510df6dee9d&v=4)


docker build . -t bluetanks
docker run -p 2022:2022 bluetanks