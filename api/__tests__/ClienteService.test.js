const ClienteService = require("../services/ClienteService");

// Teste unitario: o service e testado em isolamento total.
// O repository e substituido por um mock (jest.fn()), assim testamos so a
// logica do service, sem depender de dados reais.
//
// Abaixo ha 1 teste pronto (listar) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-02-CLIENTES.md.

describe("ClienteService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ClienteService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const clientes = [{ id: 1, nome: "Ana Souza", email: "ana@email.com" }];
      mockRepository.findAll.mockReturnValue(clientes);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(clientes);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o cliente encontrado", () => {
      const cliente = [
        { id: 1, nome: "Moniquinha Cotrinho", email: "moniquinha@gmail.com" },
      ];

      mockRepository.findById.mockReturnValue(cliente);

      const resultado = service.buscarPorId();

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(cliente);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna null", () => {
      const id = 2;
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(2)).toThrow("Cliente nao encontrado");
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o cliente criado", () => {
      const cliente = [
        { id: 3, nome: "Marcos Santos", email: "marcosSantos@gmail.com" },
      ];

      mockRepository.create.mockReturnValue(cliente);

      const resultado = service.criar();

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(cliente);
    });
    test("propaga o erro quando nome ou email estiverem faltando", () => {
      const dadosInvalidos = { nome: "", email: "marcos@gmail.com" };

      mockRepository.create.mockImplementation(() => {
        throw new Error("Dados inválidos");
      });

      expect(() => service.criar(dadosInvalidos)).toThrow("Dados inválidos");
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      const erro = new Error("Email ja cadastrado");
      mockRepository.create.mockImplementation(() => {
        throw erro;
      });

      const novoCliente = {
        nome: "Moniquinha Cotrinho",
        email: "moniquinha@gmail.com",
      };

      expect(() => service.criar(novoCliente)).toThrow("Email ja cadastrado");
    });
  });

  describe("atualizar", () => {
    test("chama repository.findById e repository.update quando o cliente existe", () => {
      const id = 1;
      const clienteExistente = {
        id: 1,
        nome: "Moniquinha Cotrinho",
        email: "moniquinha@gmail.com",
      };
      const dadosAtualizados = {
        nome: "Monica Cotrim",
        email: "monica@gmail.com",
      };

      mockRepository.findById.mockReturnValue(clienteExistente);
      mockRepository.update.mockReturnValue({
        ...clienteExistente,
        ...dadosAtualizados,
      });

      const resultado = service.atualizar(id, dadosAtualizados);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual({ ...clienteExistente, ...dadosAtualizados });
    });

    test("lanca erro 'Cliente nao encontrado' sem chamar repository.update quando o cliente nao existe", () => {
      const id = 99;
      const dadosAtualizados = { nome: "Monica", email: "monica@gmail.com" };

      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizar(id, dadosAtualizados)).toThrow(
        "Cliente nao encontrado",
      );

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      const id = 1;
      const clienteExistente = {
        id: 1,
        nome: "Moniquinha Cotrinho",
        email: "moniquinha@gmail.com",
      };
      const erro = new Error("Email ja cadastrado");

      mockRepository.findById.mockReturnValue(clienteExistente);
      mockRepository.update.mockImplementation(() => {
        throw erro;
      });

      expect(() => service.atualizar(id, { email: "outro@gmail.com" })).toThrow(
        "Email ja cadastrado",
      );
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o cliente existe", () => {
      const id = 1;
      mockRepository.delete.mockReturnValue(true);

      expect(() => service.remover(id)).not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
    test(
      "lanca erro 'Cliente nao encontrado' quando o repository retorna false", () => {
        const id = 999;
      mockRepository.findById.mockReturnValue(false);

      expect(() => service.remover(id)).toThrow("Cliente nao encontrado");
      });
  });
});
