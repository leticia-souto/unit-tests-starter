const request = require("supertest");
const createApp = require("../app");

// Teste de integracao: testa a API de ponta a ponta via HTTP real.
// Cada teste recebe uma app nova (factory), garantindo estado isolado.
//
// Abaixo ha 1 teste pronto (GET /pedidos) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-03-PEDIDOS.md.

describe("API /pedidos (integracao com supertest)", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /pedidos", () => {
    test("retorna 200 e um array com os pedidos iniciais", async () => {
      const res = await request(app).get("/pedidos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe("GET /pedidos/:id", () => {
    test("retorna 200 e o pedido quando o id existe", async () => {
      const id = 1;

      const res = await request(app).get(`/pedidos/${id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(false);
      expect(res.body).toHaveProperty("id", id);
      expect(res.body).toHaveProperty("cliente", "Ana Souza");
      expect(res.body).toHaveProperty("status", "pendente");
      expect(res.body).toHaveProperty("total", 10);
    });
    test("retorna 404 com mensagem de erro quando o pedido nao existe", async () => {
      const id = 999;

      const res = await request(app).get(`/pedidos/${id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("POST /pedidos", () => {
    test("retorna 201 e o pedido criado com o total calculado corretamente", async () => {
      const novoPedido = {
        cliente: "Marcos Santos",
        itens: [
          { nome: "Coxinha", precoUnitario: 5, quantidade: 2 },
          { nome: "Refrigerante", precoUnitario: 6, quantidade: 1 },
        ],
      };

      const res = await request(app).post("/pedidos").send(novoPedido);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("cliente", novoPedido.cliente);
      expect(res.body).toHaveProperty("status", "pendente");
      expect(res.body).toHaveProperty("total", 16);
    });

    test("retorna 400 quando o cliente esta faltando", async () => {
      const pedidoSemCliente = {
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
      };

      const res = await request(app).post("/pedidos").send(pedidoSemCliente);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando a lista de itens esta vazia", async () => {
      const pedidoSemItens = {
        cliente: "Marcos Santos",
        itens: [],
      };

      const res = await request(app).post("/pedidos").send(pedidoSemItens);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando algum item tem preco ou quantidade invalidos", async () => {
      const pedidoItemInvalido = {
        cliente: "Marcos Santos",
        itens: [{ nome: "Coxinha", precoUnitario: 0, quantidade: 2 }],
      };

      const res = await request(app).post("/pedidos").send(pedidoItemInvalido);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("PATCH /pedidos/:id/status", () => {
    test("retorna 200 e o pedido com o novo status quando o id existe", async () => {
      const id = 1;

      const res = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: "pago" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", id);
      expect(res.body).toHaveProperty("status", "pago");
    });

    test("retorna 404 quando o pedido nao existe", async () => {
      const id = 999;

      const res = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: "pago" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o status enviado e invalido", async () => {
      const id = 1;

      const res = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: "inexistente" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 ao tentar alterar o status de um pedido ja cancelado", async () => {
      const id = 1;

      await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: "cancelado" });

      const res = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: "pago" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("DELETE /pedidos/:id", () => {
    test("retorna 204 quando o pedido e removido com sucesso", async () => {
      const id = 1;

      const res = await request(app).delete(`/pedidos/${id}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    test("pedido removido nao aparece mais na listagem", async () => {
      const id = 1;

      await request(app).delete(`/pedidos/${id}`);

      const res = await request(app).get("/pedidos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
      expect(res.body.find((pedido) => pedido.id === id)).toBeUndefined();
    });

    test("retorna 404 quando o pedido nao existe", async () => {
      const id = 999;

      const res = await request(app).delete(`/pedidos/${id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});
