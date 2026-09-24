const request = require("supertest");
const createApp = require("../app");

// Teste de integracao: testa a API de ponta a ponta via HTTP real.
// Cada teste recebe uma app nova (factory), garantindo estado isolado.
//
// Abaixo ha 1 teste pronto (GET /clientes) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-02-CLIENTES.md.

describe("API /clientes (integracao com supertest)", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /clientes", () => {
    test("retorna 200 e um array com os clientes iniciais", async () => {
      const res = await request(app).get("/clientes");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /clientes/:id", () => {
    test("retorna 200 e o cliente quando o id existe", async () => {
      const id = 1;
      const res = await request(app).get(`/clientes/${id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(false);
      expect(res.body).toHaveProperty("id", id);
    });

    test("retorna 404 com mensagem de erro quando o cliente nao existe", async () => {
      const id = 999;

      const res = await request(app).get(`/clientes/${id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro", "Cliente nao encontrado");
    });
  });

  describe("POST /clientes", () => {
    test("retorna 201 e o cliente criado com id gerado", async () => {
      const novoCliente = { nome: "Marcos Santos", email: "marcos@gmail.com" };

      const res = await request(app).post("/clientes").send(novoCliente);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("nome", novoCliente.nome);
      expect(res.body).toHaveProperty("email", novoCliente.email);
    });

    test("retorna 400 quando o nome esta faltando", async () => {
      const clienteSemNome = { email: "marcos@gmail.com" };

      const res = await request(app).post("/clientes").send(clienteSemNome);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o email esta faltando", async () => {
      const clienteSemEmail = { nome: "Marcos Santos" };

      const res = await request(app).post("/clientes").send(clienteSemEmail);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o email ja esta cadastrado", async () => {
      const response = await request(app)
        .post("/clientes")
        .send({ nome: "Outro Cliente", email: "ana@email.com" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ erro: "Email ja cadastrado" });
    });

    test("cliente criado aparece em GET /clientes", async () => {
      const novoCliente = { nome: "Larissa", email: "larissa@gmail.com" };

      const resPost = await request(app).post("/clientes").send(novoCliente);
      const idCriado = resPost.body.id;

      const resGet = await request(app).get("/clientes");

      const encontrado = resGet.body.find((p) => p.id === idCriado);
      expect(encontrado).toBeDefined();
      expect(encontrado).toHaveProperty("nome", novoCliente.nome);
    });
  });

  describe("PUT /clientes/:id", () => {
    test("retorna 200 e o cliente atualizado quando o id existe", async () => {
      const id = 1;
      const dadosAtualizados = { nome: "Monica Cotrim" };

      const res = await request(app)
        .put(`/clientes/${id}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", id);
      expect(res.body).toHaveProperty("nome", dadosAtualizados.nome);
    });

    test("retorna 404 quando o cliente nao existe", async () => {
      const id = 999;

      const res = await request(app)
        .put(`/clientes/${id}`)
        .send({ nome: "Qualquer Nome" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o novo email ja pertence a outro cliente", async () => {
      const id = 999;

      const res = await request(app)
        .put(`/clientes/${id}`)
        .send({ nome: "Morticia Gomes" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("DELETE /clientes/:id", () => {
    test("retorna 204 quando o cliente e removido com sucesso", async () => {
      const novoCliente = {
        nome: "Morticia Gomes",
        email: "morticia@gmail.com",
      };
      const resPost = await request(app).post("/clientes").send(novoCliente);
      const id = resPost.body.id;

      const res = await request(app).delete(`/clientes/${id}`);

      expect(res.status).toBe(204);
    });

    test("cliente removido nao aparece mais na listagem", async () => {
      const id = 1;

      await request(app).delete(`/clientes/${id}`);

      const res = await request(app).get("/clientes");

      const encontrado = res.body.find((c) => c.id === id);
      expect(encontrado).toBeUndefined();
    });

    test("retorna 404 quando o cliente nao existe", async () => {
      const idInexistente = 99999;

      const res = await request(app).delete(`/clientes/${idInexistente}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});
