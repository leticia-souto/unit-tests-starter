const ProdutoService = require("../services/ProdutoService");

describe("ProdutoService - testes unitários", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    service = new ProdutoService(mockRepository);
  });

  describe("Listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const produtos = [{ id: 1, nome: "coxinha", preco: 5 }];

      mockRepository.findAll.mockReturnValue(produtos);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produtos);
    });
  });
  //criar teste repository.findById]
  describe("BuscarPorId", () => {
    test("chama repository.findById uma vez e retorna o resultado", () => {
      const produto = [{ id: 1, nome: "coxinha", preco: 5 }];

      mockRepository.findById.mockReturnValue(produto);

      const resultado = service.buscarPorId();

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produto);
    });
  });

  describe("Criar", () => {
    test("chama repository.create e retorna um produto criado", () => {
      const produto = [{ id: 3, nome: "Morando cravejado", preco: 10 }];

      mockRepository.create.mockReturnValue(produto);

      const resultado = service.criar();

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produto);
    });

    test("deve propagar o erro lançado pelo repository quando os dados forem inválidos", () => {
      const dadosInvalidos = { nome: "", preco: -5 };

      mockRepository.create.mockImplementation(() => {
        throw new Error("Dados inválidos");
      });

      expect(() => service.criar(dadosInvalidos)).toThrow("Dados inválidos");
    });
  });

  describe("Remover", () => {
    test("deve chamar mockRepository.delete com o id correto quando o produto existe", () => {
      const id = 3;
      mockRepository.delete.mockReturnValue(true);

      expect(() => service.remover(id)).not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    test("deve lançar erro 'Produto nao encontrado' quando o repository retornar false", () => {
      const id = 999;
      mockRepository.findById.mockReturnValue(false);

      expect(() => service.remover(id)).toThrow("Produto nao encontrado");
    });
  });
});
