const PedidoService = require("../services/PedidoService");

// Teste unitario: o service e testado em isolamento total.
// O repository e substituido por um mock (jest.fn()), assim testamos so a
// logica do service, sem depender de dados reais.
//
// Abaixo ha 1 teste pronto (listar) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-03-PEDIDOS.md.

describe("PedidoService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    service = new PedidoService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const pedidos = [
        {
          id: 1,
          cliente: "Ana Souza",
          itens: [],
          status: "pendente",
          total: 0,
        },
      ];
      mockRepository.findAll.mockReturnValue(pedidos);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(pedidos);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o pedido encontrado", () => {
      const id = 1;
      const pedido = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };

      mockRepository.findById.mockReturnValue(pedido);

      const resultado = service.buscarPorId(id);

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(resultado).toEqual(pedido);
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retorna null", () => {
      const id = 999;
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(id)).toThrow("Pedido nao encontrado");
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o pedido criado com o total calculado", () => {
      const dados = {
        cliente: "Marcos Santos",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
      };
      const pedidoCriado = {
        id: 2,
        cliente: "Marcos Santos",
        itens: dados.itens,
        status: "pendente",
        total: 10,
      };

      mockRepository.create.mockReturnValue(pedidoCriado);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(pedidoCriado);
    });

    test("propaga o erro quando o cliente estiver faltando", () => {
      const dados = {
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
      };
      const erro = new Error("Cliente e obrigatorio");

      mockRepository.create.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.criar(dados)).toThrow("Cliente e obrigatorio");
    });

    test("propaga o erro quando a lista de itens estiver vazia", () => {
      const dados = { cliente: "Marcos Santos", itens: [] };
      const erro = new Error("Pedido deve ter ao menos um item");

      mockRepository.create.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.criar(dados)).toThrow(
        "Pedido deve ter ao menos um item",
      );
    });

    test("propaga o erro quando algum item tiver preco ou quantidade invalidos", () => {
      const dados = {
        cliente: "Marcos Santos",
        itens: [{ nome: "Coxinha", precoUnitario: 0, quantidade: 2 }],
      };
      const erro = new Error(
        "Itens devem ter nome, preco e quantidade validos",
      );

      mockRepository.create.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.criar(dados)).toThrow(
        "Itens devem ter nome, preco e quantidade validos",
      );
    });
  });

  describe("atualizarStatus", () => {
    test("chama repository.findById e repository.updateStatus quando o pedido existe", () => {
      const id = 1;
      const pedidoExistente = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };
      const novoStatus = "pago";

      mockRepository.findById.mockReturnValue(pedidoExistente);
      mockRepository.updateStatus.mockReturnValue({
        ...pedidoExistente,
        status: novoStatus,
      });

      const resultado = service.atualizarStatus(id, novoStatus);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.updateStatus).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(id, novoStatus);
      expect(resultado).toEqual({ ...pedidoExistente, status: novoStatus });
    });

    test("lanca erro 'Pedido nao encontrado' sem chamar repository.updateStatus quando o pedido nao existe", () => {
      const id = 999;
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizarStatus(id, "pago")).toThrow(
        "Pedido nao encontrado",
      );
      expect(mockRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo status for invalido", () => {
      const id = 1;
      const pedidoExistente = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };
      const erro = new Error("Status invalido");

      mockRepository.findById.mockReturnValue(pedidoExistente);
      mockRepository.updateStatus.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.atualizarStatus(id, "inexistente")).toThrow(
        "Status invalido",
      );
    });

    test("propaga o erro quando o pedido ja estiver cancelado", () => {
      const id = 1;
      const pedidoCancelado = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "cancelado",
        total: 10,
      };
      const erro = new Error("Pedido cancelado nao pode ser alterado");

      mockRepository.findById.mockReturnValue(pedidoCancelado);
      mockRepository.updateStatus.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.atualizarStatus(id, "pago")).toThrow(
        "Pedido cancelado nao pode ser alterado",
      );
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o pedido existe", () => {
      const id = 1;
      mockRepository.delete.mockReturnValue(true);

      const resultado = service.remover(id);

      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
      expect(resultado).toBeUndefined();
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retorna false", () => {
      const id = 999;
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(id)).toThrow("Pedido nao encontrado");
    });
  });
});
