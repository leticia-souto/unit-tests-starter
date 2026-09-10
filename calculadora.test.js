const { soma, subtrai, multiplica, divide, ehPar, raiz, media } = require("./calculadora")

describe("soma", () => {
    test("soma dois numeros positivos", () => {
        expect(soma(2, 3)).toBe(5)
    })

     test("soma dois numeros negativos", () => {
        expect(soma(-3, -3)).toBe(-6)
    })

    //soma com numero negativo
})

describe("raiz", () => {
    test("calcula a raiz de numero não exato com precisão", () => {
        expect(raiz(2)).toBeCloseTo(1.414)
    })

    test("lança erro para numero negativo", () => {
        expect(() => raiz(-4)).toThrow("Nao e possivel calcular raiz de numero negativo")
    })

    test("calcula a raiz quadrada de 9", () => {
        expect(raiz(9)).toBeCloseTo(3)
    })
    //teste para calcular a raiz quadrada de 9
})

describe("subtrai", () => {
    test("retorna o resultado correta de uma subtração", () => {
        expect(subtrai(5, 3)).toBe(2)
    })

    test("retorna o resultado correta de uma subtração ", () => {
        expect(subtrai(2, 5)).toBe(-3)
    })
})

describe("multiplica", () => {
    test("Retorna o produto correto de dois numeros", () => {
        expect(multiplica(2, 2)).toBe(4)
    })

    test("Retorna 0 quando um dos fatores for 0", () => {
        expect(multiplica(2, 0)).toBe(0)
    })

    test("O resultado deve ser maior do que cada um dos fatores individualmente (quando maiores que 1) ", () => {
        expect(multiplica(5, 2)).toBe(10)
    })
})

describe("divide", () => {
    test("Retorna resultado correto de uma divisão", () => {
        expect(divide(20, 10)).toBe(2)
    })
    
    test("Lança erro ao dividir por zero", () => {
        expect(() => divide(5, 0)).toThrow("Nao e possivel dividir por zero")
    })
})

describe("ehPar", () => {
    test("Retorna um valor verdadeiro para um numero par", () => {
        expect(ehPar(2)).toBe(true)
    })

    test("Retorna um valor falso para um numero ímpar", () => {
        expect(ehPar(3)).toBe(false)
    })
})

describe("media", () => {
    test("Calcula corretamente a media de uma lista de inteiros", () => {
        expect(media([10, 10])).toBe(10)
    })

    test("Calcula corretamente a media de uma lista de decimais", () => {
        expect(media([10, 3])).toBeCloseTo(6.5)
    })

    test("Calcula corretamente a media de uma lista de decimais", () => {
        expect(() => media([])).toThrow("A lista de numeros nao pode ser vazia")
    })

    test("Calcula corretaete a media de uma lista de decimais", () => {
        expect(() => media(null)).toThrow("A lista de numeros nao pode ser vazia")
    })
})