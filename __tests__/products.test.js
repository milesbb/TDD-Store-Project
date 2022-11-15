import supertest from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import server from "../src/server.js";
import ProductsModel from "../src/products/model.js";
import { response } from "express";

dotenv.config();

const client = supertest(server);

const newProduct = {
  name: "testProduct",
  description: "test product for testing",
  price: 5,
};

const notValidProduct = {
  description: "This should fail",
  price: 10,
};

const putData = {
  name: "newName",
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_CONNECTION);
  const product = new ProductsModel(newProduct);
  await product.save();
});

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
});

describe("Test Products APIs", () => {
  it("Should check that Mongo connection string is not undefined", () => {
    expect(process.env.MONGO_TEST_CONNECTION).toBeDefined();
  });

  it("Should test that GET /products returns a success status and a body", async () => {
    const response = await client.get("/products").expect(200);
    console.log(response.body);
  });

  it("Should test that POST /products with a not valid product returns 400", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });

  it("Should test that GET /products/:id with a non-existing ID returns 404", async () => {
    await client.get("/products/123456123456123456123456").expect(404);
  });

  it("Should test that GET /products/:id returns the correct product", async () => {
    const response = await client.get("/products");
    console.log(response.body[0]);
    const initialResponseId = response.body[0]._id;
    const response2 = await client
      .get("/products/" + initialResponseId)
      .expect(200);
    expect(response2.body._id).toEqual(initialResponseId);
  });

  it("Should test that GET /products/:id with a non-existing ID returns 404", async () => {
    await client.get("/products/123456123456123456123456").expect(404);
  });

  it("Should test that PUT /products/:id accepts requests", async () => {
    const response = await client.get("/products");
    console.log(response.body[0]);
    const initialResponseId = response.body[0]._id;
    const response2 = await client
      .put("/products/" + initialResponseId)
      .expect(200);
  });

  it("Should test that editing a product name with PUT /products/:id is successful", async () => {
    const response = await client.get("/products");
    console.log(response.body[0]);
    const initialResponseId = response.body[0]._id;
    const initialResponseName = response.body[0].name;
    const response2 = await client
      .put("/products/" + initialResponseId)
      .send(putData)
      .expect(200);
    expect(response2.body.name).toEqual("newName");
  });

  it("Should test that the type of name in a response from PUT /products/:id is 'string'", async () => {
    const response = await client.get("/products");
    console.log(response.body[0]);
    const initialResponseId = response.body[0]._id;
    const initialResponseName = response.body[0].name;
    const response2 = await client
      .put("/products/" + initialResponseId)
      .send(putData)
      .expect(200);
    expect(typeof response2.body.name).toEqual("string");
  });

  it("Should test that PUT /products/:id with a non-existing ID returns 404", async () => {
    await client.put("/products/123456123456123456123456").expect(404);
  });

  it("Should test that DELETE /products/:id returns 204 after deletion", async () => {
    const response = await client.get("/products");
    console.log(response.body[0]);
    const initialResponseId = response.body[0]._id;
    const response2 = await client
      .delete("/products/" + initialResponseId)
      .expect(204);
  });

  it("Should test that DELETE /products/:id with a non-existing ID returns 404", async () => {
    await client.delete("/products/123456123456123456123456").expect(404);
  });
});
