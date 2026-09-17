const request = require("supertest");
const createApp = require("../app");

describe("API /produtos - testes de integração", () => {
  let app;
  beforeEach(() => {
    app = createApp();
  });

  describe("GET /produtos", () => {
    test("Retorna 200 e um array com os produtos iniciais", async () => {
      const res = await request(app).get("/produtos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });
  //teste GET/produtos/:id
  describe("GET /produtos /:id", () => {
    test("Retorna 200 e um array com os produto por id", async () => {
      const id = 1;
      const res = await request(app).get(`/produtos/${id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(false);
      expect(res.body).toHaveProperty("id", id);
    });
  });

  describe("POST /produtos", () => {
    test("Deve retornar 201 e o produto criado com id gerado", async () => {
      const novoProduto = { nome: "coxinha", preco: 5 };

      const res = await request(app).post("/produtos").send(novoProduto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("nome", novoProduto.nome);
      expect(res.body).toHaveProperty("preco", novoProduto.preco);
    });

    test("Deve retornar 400 com { erro: ... } quando o nome estiver faltando", async () => {
      const produtoSemNome = { preco: 5 };

      const res = await request(app).post("/produtos").send(produtoSemNome);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("Deve retornar 400 com { erro: ... } quando o preco estiver faltando", async () => {
      const produtoSemPreco = { nome: "coxinha" };

      const res = await request(app).post("/produtos").send(produtoSemPreco);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("O produto criado deve aparecer em uma chamada seguinte a GET /produtos", async () => {
      const novoProduto = { nome: "esfiha", preco: 4 };

      const resPost = await request(app).post("/produtos").send(novoProduto);
      const idCriado = resPost.body.id;

      const resGet = await request(app).get("/produtos");

      const encontrado = resGet.body.find((p) => p.id === idCriado);
      expect(encontrado).toBeDefined();
      expect(encontrado).toHaveProperty("nome", novoProduto.nome);
    });
  });

  describe("DELETE /produtos/:id", () => {
    test("Deve retornar 204 quando o produto e removido com sucesso", async () => {
      const novoProduto = { nome: "pastel", preco: 6 };
      const resPost = await request(app).post("/produtos").send(novoProduto);
      const id = resPost.body.id;

      const res = await request(app).delete(`/produtos/${id}`);

      expect(res.status).toBe(204);
    });

    test("O produto removido nao deve mais aparecer em GET /produtos/:id (deve retornar 404)", async () => {
      const novoProduto = { nome: "kibe", preco: 7 };
      const resPost = await request(app).post("/produtos").send(novoProduto);
      const id = resPost.body.id;

      await request(app).delete(`/produtos/${id}`);

      const resGet = await request(app).get(`/produtos/${id}`);

      expect(resGet.status).toBe(404);
    });

    test("Deve retornar 404 com { erro: ... } quando o produto nao existir", async () => {
      const idInexistente = 99999;

      const res = await request(app).delete(`/produtos/${idInexistente}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});
