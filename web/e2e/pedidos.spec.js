import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);

  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();
});

test("Lista os pedidos iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  const linha = page.getByRole("row").filter({ hasText: "Ana Souza" });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("1");
  await expect(linha).toContainText("2x Coxinha");
  await expect(page.getByRole("cell", { name: "R$ 10,00" })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});

test("Cadastra um pedido novo", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Bruno Lima");
  await page.getByLabel("Produto").selectOption("Pastel");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByText("1x Pastel")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linha).toContainText("1x Pastel");
  await expect(linha).toContainText("R$ 8,00");
  await expect(page.getByLabel("Status do pedido 2")).toHaveValue("pendente");
});

test("Cadastra um pedido com vários itens", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Ana Souza");

  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByLabel("Quantidade").fill("3");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByLabel("Produto").selectOption("Empada");
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByText("3x Coxinha")).toBeVisible();
  await expect(page.getByText("1x Empada")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /3x Coxinha/ });
  await expect(linha).toContainText("Ana Souza");
  await expect(linha).toContainText("3x Coxinha");
  await expect(linha).toContainText("1x Empada");
  await expect(linha).toContainText("R$ 21,00");
});

test("Quantidade volta a 1 após adicionar item", async ({ page }) => {
  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByLabel("Quantidade").fill("5");
  await expect(page.getByLabel("Quantidade")).toHaveValue("5");

  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByText("5x Coxinha")).toBeVisible();
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
});

test("Não cria pedido sem cliente", async ({ page }) => {
  const linhas = page.locator("tbody tr");
  await expect(linhas).toHaveCount(1);

  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("1x Coxinha")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();
  await expect(linhas).toHaveCount(1);
});

test("Não cria pedido sem itens", async ({ page }) => {
  const linhas = page.locator("tbody tr");
  await expect(linhas).toHaveCount(1);

  await page.getByLabel("Cliente").selectOption("Ana Souza");
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(
    page.getByText("Pedido deve ter ao menos um item"),
  ).toBeVisible();
  await expect(linhas).toHaveCount(1);
});

test("Altera o status de um pedido", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await expect(status).toHaveValue("pendente");

  await status.selectOption("pago");

  await expect(status).toHaveValue("pago");
});

test("Pedido cancelado não pode ser alterado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");

  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pago");

  await expect(
    page.getByText("Pedido cancelado nao pode ser alterado"),
  ).toBeVisible();
  await expect(status).toHaveValue("cancelado");
});

test("Remove um pedido", async ({ page }) => {
  const linha = page.getByRole("row").filter({ hasText: "Ana Souza" });
  await linha.getByRole("button", { name: "Remover" }).click();

  await expect(linha).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(1);
});

test("Ciclo completo do pedido", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Bruno Lima");
  await page.getByLabel("Produto").selectOption("Empada");
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("2x Empada")).toBeVisible();
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  const status = page.getByLabel("Status do pedido 2");

  await expect(linha).toContainText("2x Empada");
  await expect(linha).toContainText("R$ 12,00");
  await expect(status).toHaveValue("pendente");

  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");

  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pendente");
  await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
  await expect(status).toHaveValue("cancelado");

  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(linha).toHaveCount(0);
});
