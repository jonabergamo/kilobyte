"use client"
import { createContext, useContext, useEffect, ReactNode, useSyncExternalStore } from "react"

export const en = {
  brand: "Kilobyte",
  tagline: "Gear that keeps up with you",
  nav: { search: "Search products", cart: "Cart", account: "Account", orders: "Orders", wishlist: "Wishlist", signIn: "Sign in", signOut: "Sign out", manage: "Manage store", categories: "Categories", brands: "Brands" },
  home: { hero: "Build the setup you actually want.", heroSub: "Laptops, components and peripherals with honest prices, twelve month warranty and fast shipping from São Paulo.", shop: "Shop all", featured: "Picked for you", onSale: "On sale now", categories: "Browse by category", brandsTitle: "Brands we carry" },
  product: { addToCart: "Add to cart", added: "Added to cart", outOfStock: "Out of stock", lowStock: (n: number) => `Only ${n} left`, inStock: "In stock", specs: "Specifications", reviews: "Reviews", noReviews: "No reviews yet.", writeReview: "Write a review", reviewHint: "Only customers who bought this product can review it.", rating: "Rating", title: "Title", body: "Your review", send: "Publish review", reviewed: "Thanks for the review", wishlist: "Save to wishlist", unwishlist: "Remove from wishlist", wishlisted: "Saved", off: (pct: number) => `${pct}% off`, related: "You might also like", brand: "Brand", sku: "Item" },
  cart: { title: "Your cart", empty: "Your cart is empty.", keepShopping: "Keep shopping", subtotal: "Subtotal", discount: "Discount", shipping: "Shipping", free: "Free", total: "Total", checkout: "Go to checkout", coupon: "Coupon code", apply: "Apply", remove: "Remove", couponOk: (c: string) => `Coupon ${c} applied`, couponBad: { inactive: "That coupon is not active", expired: "That coupon expired", min_subtotal: "Your subtotal is below the minimum for this coupon", unknown: "No coupon with that code" } as Record<string, string>, freeShippingHint: (v: string) => `Add ${v} more for free shipping`, qty: "Quantity", items: (n: number) => (n === 1 ? "1 item" : `${n} items`) },
  checkout: { title: "Checkout", address: "Shipping address", name: "Full name", line1: "Street and number", line2: "Apartment, floor (optional)", city: "City", state: "State", zip: "ZIP code", pay: "Pay with Stripe", paying: "Taking you to Stripe...", signInFirst: "Sign in to finish your order.", successTitle: "Thank you, your order is in.", waiting: "Confirming your payment with Stripe...", paid: "Payment confirmed. We'll start packing soon.", orderNumber: "Order", viewOrder: "View order", cancelTitle: "Payment cancelled", cancelBody: "Nothing was charged. Your cart is still here whenever you're ready.", testCard: "Test mode. Use card 4242 4242 4242 4242, any future date, any CVC." },
  account: { title: "My account", orders: "My orders", noOrders: "You haven't ordered anything yet.", wishlist: "Wishlist", noWishlist: "Nothing saved yet.", settings: "Settings", nameLabel: "Name", save: "Save", saved: "Saved", password: "Password", current: "Current password", next: "New password", change: "Change password", changed: "Password changed", wrong: "That's not your current password", placed: "Placed", timeline: "Order timeline", shipTo: "Shipping to" },
  status: { pending: "Awaiting payment", paid: "Paid", packing: "Packing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" } as Record<string, string>,
  auth: { signIn: "Sign in", register: "Create account", email: "Email", password: "Password", name: "Your name", noAccount: "New here?", haveAccount: "Already have an account?", bad: "Wrong email or password", taken: "That email is already registered", demoHint: "Looking around? Use the demo accounts. Nothing here charges a real card.", demoCustomer: "Enter as customer", demoManager: "Enter as manager", welcome: "Welcome back" },
  search: { title: (q: string) => (q ? `Results for “${q}”` : "All products"), results: (n: number) => (n === 1 ? "1 product" : `${n} products`), filters: "Filters", category: "Category", brand: "Brand", price: "Price", min: "Min", max: "Max", inStock: "In stock only", sort: "Sort", sorts: { relevance: "Relevance", price_asc: "Price, low to high", price_desc: "Price, high to low", rating: "Best rated", newest: "Newest" } as Record<string, string>, clear: "Clear filters", none: "Nothing matches those filters." },
  manage: {
    title: "Manage store", dashboard: "Dashboard", products: "Products", categories: "Categories", brands: "Brands", orders: "Orders", coupons: "Coupons", reviews: "Reviews", customers: "Customers", backToStore: "Back to store",
    revenue30: "Revenue, last 30 days", orders30: "Orders, last 30 days", avgTicket: "Average ticket", lowStock: "Low stock", latestReviews: "Latest reviews", byStatus: "Orders by status", perDay: "Sales per day",
    newProduct: "New product", editProduct: "Edit product", name: "Name", slug: "Slug", description: "Description", price: "Price (R$)", promo: "Promo price (R$)", stock: "Stock", active: "Active", images: "Image URLs", addImage: "Add image", specs: "Specifications", addSpec: "Add row", key: "Spec", value: "Value", save: "Save", saved: "Saved", delete: "Delete", deleted: "Deleted", search: "Search products", inactive: "inactive",
    newCategory: "New category", parent: "Parent category", noParent: "Top level", position: "Position", newBrand: "New brand",
    orderNo: "Order", customer: "Customer", total: "Total", date: "Date", advance: "Move to", note: "Note for the customer (optional)", cancel: "Cancel order", statusChanged: "Status updated", all: "All",
    newCoupon: "New coupon", code: "Code", kind: "Type", percent: "Percent", amount: "Amount (R$)", couponValue: "Value", minSubtotal: "Minimum subtotal (R$)", expires: "Expires", uses: "Uses", stripe: "Stripe id", noStripe: "not mirrored, no Stripe key",
    hide: "Hide", unhide: "Show", hidden: "hidden", product: "Product", by: "by",
    joined: "Joined", ordersCount: "Orders", spent: "Spent",
  },
  common: { cancel: "Cancel", close: "Close", failed: "That didn't work", back: "Back", loading: "Loading...", none: "None", yes: "Yes", no: "No", confirmDelete: "Delete this? It can't be undone." },
  banner: { title: "Demo store.", body: "Everything is in Stripe test mode, so nothing charges a real card. Pay with 4242 4242 4242 4242, any future date and any CVC. The catalogue resets every night.", customer: "customer", manager: "manager", code: "How it works", more: "More of my work", close: "Dismiss" },
  credit: { by: "Built by Jonathan Bergamo", code: "Source code", portfolio: "More of my work", body: "A 2023 college project I rebuilt in 2026 as a real store. Next.js, Drizzle on Postgres, Stripe Checkout." },
  footer: { help: "Free shipping over R$ 300. Twelve month warranty. Ships from São Paulo." },
}
export type Dict = typeof en

export const pt: Dict = {
  brand: "Kilobyte",
  tagline: "Equipamento que acompanha você",
  nav: { search: "Buscar produtos", cart: "Carrinho", account: "Conta", orders: "Pedidos", wishlist: "Favoritos", signIn: "Entrar", signOut: "Sair", manage: "Gerenciar loja", categories: "Categorias", brands: "Marcas" },
  home: { hero: "Monte o setup que você quer de verdade.", heroSub: "Notebooks, componentes e periféricos com preço honesto, doze meses de garantia e envio rápido de São Paulo.", shop: "Ver tudo", featured: "Escolhidos para você", onSale: "Em promoção", categories: "Navegue por categoria", brandsTitle: "Marcas que a gente trabalha" },
  product: { addToCart: "Adicionar ao carrinho", added: "Adicionado ao carrinho", outOfStock: "Esgotado", lowStock: (n) => `Só ${n} em estoque`, inStock: "Em estoque", specs: "Especificações", reviews: "Avaliações", noReviews: "Nenhuma avaliação ainda.", writeReview: "Escrever avaliação", reviewHint: "Só quem comprou este produto pode avaliar.", rating: "Nota", title: "Título", body: "Sua avaliação", send: "Publicar avaliação", reviewed: "Valeu pela avaliação", wishlist: "Salvar nos favoritos", unwishlist: "Tirar dos favoritos", wishlisted: "Salvo", off: (pct) => `${pct}% off`, related: "Você também pode gostar", brand: "Marca", sku: "Item" },
  cart: { title: "Seu carrinho", empty: "Seu carrinho está vazio.", keepShopping: "Continuar comprando", subtotal: "Subtotal", discount: "Desconto", shipping: "Frete", free: "Grátis", total: "Total", checkout: "Ir para o pagamento", coupon: "Cupom", apply: "Aplicar", remove: "Remover", couponOk: (c) => `Cupom ${c} aplicado`, couponBad: { inactive: "Esse cupom não está ativo", expired: "Esse cupom venceu", min_subtotal: "Seu subtotal está abaixo do mínimo deste cupom", unknown: "Nenhum cupom com esse código" }, freeShippingHint: (v) => `Faltam ${v} para o frete grátis`, qty: "Quantidade", items: (n) => (n === 1 ? "1 item" : `${n} itens`) },
  checkout: { title: "Pagamento", address: "Endereço de entrega", name: "Nome completo", line1: "Rua e número", line2: "Apartamento, andar (opcional)", city: "Cidade", state: "Estado", zip: "CEP", pay: "Pagar com Stripe", paying: "Levando você para o Stripe...", signInFirst: "Entre para finalizar seu pedido.", successTitle: "Obrigado, seu pedido foi recebido.", waiting: "Confirmando seu pagamento com o Stripe...", paid: "Pagamento confirmado. Já vamos começar a embalar.", orderNumber: "Pedido", viewOrder: "Ver pedido", cancelTitle: "Pagamento cancelado", cancelBody: "Nada foi cobrado. Seu carrinho continua aqui quando quiser.", testCard: "Modo de teste. Use o cartão 4242 4242 4242 4242, qualquer data futura e qualquer CVC." },
  account: { title: "Minha conta", orders: "Meus pedidos", noOrders: "Você ainda não fez nenhum pedido.", wishlist: "Favoritos", noWishlist: "Nada salvo ainda.", settings: "Configurações", nameLabel: "Nome", save: "Salvar", saved: "Salvo", password: "Senha", current: "Senha atual", next: "Nova senha", change: "Trocar senha", changed: "Senha trocada", wrong: "Essa não é sua senha atual", placed: "Feito em", timeline: "Andamento do pedido", shipTo: "Entrega em" },
  status: { pending: "Aguardando pagamento", paid: "Pago", packing: "Embalando", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" },
  auth: { signIn: "Entrar", register: "Criar conta", email: "Email", password: "Senha", name: "Seu nome", noAccount: "Novo por aqui?", haveAccount: "Já tem conta?", bad: "Email ou senha incorretos", taken: "Esse email já está cadastrado", demoHint: "Só dando uma olhada? Use as contas demo. Nada aqui cobra um cartão de verdade.", demoCustomer: "Entrar como cliente", demoManager: "Entrar como gerente", welcome: "Bem vindo de volta" },
  search: { title: (q) => (q ? `Resultados para “${q}”` : "Todos os produtos"), results: (n) => (n === 1 ? "1 produto" : `${n} produtos`), filters: "Filtros", category: "Categoria", brand: "Marca", price: "Preço", min: "Mín", max: "Máx", inStock: "Só em estoque", sort: "Ordenar", sorts: { relevance: "Relevância", price_asc: "Menor preço", price_desc: "Maior preço", rating: "Melhor avaliados", newest: "Novidades" }, clear: "Limpar filtros", none: "Nada bate com esses filtros." },
  manage: {
    title: "Gerenciar loja", dashboard: "Painel", products: "Produtos", categories: "Categorias", brands: "Marcas", orders: "Pedidos", coupons: "Cupons", reviews: "Avaliações", customers: "Clientes", backToStore: "Voltar para a loja",
    revenue30: "Receita, últimos 30 dias", orders30: "Pedidos, últimos 30 dias", avgTicket: "Ticket médio", lowStock: "Estoque baixo", latestReviews: "Últimas avaliações", byStatus: "Pedidos por status", perDay: "Vendas por dia",
    newProduct: "Novo produto", editProduct: "Editar produto", name: "Nome", slug: "Slug", description: "Descrição", price: "Preço (R$)", promo: "Preço promocional (R$)", stock: "Estoque", active: "Ativo", images: "URLs das imagens", addImage: "Adicionar imagem", specs: "Especificações", addSpec: "Adicionar linha", key: "Item", value: "Valor", save: "Salvar", saved: "Salvo", delete: "Excluir", deleted: "Excluído", search: "Buscar produtos", inactive: "inativo",
    newCategory: "Nova categoria", parent: "Categoria pai", noParent: "Nível principal", position: "Posição", newBrand: "Nova marca",
    orderNo: "Pedido", customer: "Cliente", total: "Total", date: "Data", advance: "Mover para", note: "Nota para o cliente (opcional)", cancel: "Cancelar pedido", statusChanged: "Status atualizado", all: "Todos",
    newCoupon: "Novo cupom", code: "Código", kind: "Tipo", percent: "Porcentagem", amount: "Valor (R$)", couponValue: "Valor", minSubtotal: "Subtotal mínimo (R$)", expires: "Vence em", uses: "Usos", stripe: "Id no Stripe", noStripe: "não espelhado, sem chave do Stripe",
    hide: "Ocultar", unhide: "Mostrar", hidden: "oculta", product: "Produto", by: "por",
    joined: "Cadastro", ordersCount: "Pedidos", spent: "Gasto",
  },
  common: { cancel: "Cancelar", close: "Fechar", failed: "Não deu certo", back: "Voltar", loading: "Carregando...", none: "Nenhum", yes: "Sim", no: "Não", confirmDelete: "Excluir? Não dá para desfazer." },
  banner: { title: "Loja demo.", body: "Tudo está no modo de teste do Stripe, então nada cobra um cartão de verdade. Pague com 4242 4242 4242 4242, qualquer data futura e qualquer CVC. O catálogo reinicia toda noite.", customer: "cliente", manager: "gerente", code: "Como funciona", more: "Mais do meu trabalho", close: "Fechar" },
  credit: { by: "Feito por Jonathan Bergamo", code: "Código fonte", portfolio: "Mais do meu trabalho", body: "Um projeto da faculdade de 2023 que refiz em 2026 como uma loja de verdade. Next.js, Drizzle no Postgres, Stripe Checkout." },
  footer: { help: "Frete grátis acima de R$ 300. Doze meses de garantia. Enviamos de São Paulo." },
}

export type Locale = "en" | "pt"
const dicts: Record<Locale, Dict> = { en, pt }
export const intlTag = { en: "en-US", pt: "pt-BR" }

const listeners = new Set<() => void>()
const read = () => {
  try {
    return localStorage.getItem("kb.lang") === "pt" ? "pt" : "en"
  } catch {
    return "en"
  }
}
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

type Ctx = { locale: Locale; t: Dict; setLocale: (l: Locale) => void }
const I18nContext = createContext<Ctx>({ locale: "en", t: en, setLocale: () => {} })

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, read, () => "en" as Locale)
  useEffect(() => {
    document.documentElement.lang = intlTag[locale]
  }, [locale])
  const setLocale = (l: Locale) => {
    try {
      localStorage.setItem("kb.lang", l)
    } catch {}
    listeners.forEach((fn) => fn())
  }
  return <I18nContext.Provider value={{ locale, t: dicts[locale], setLocale }}>{children}</I18nContext.Provider>
}

export const useT = () => useContext(I18nContext)
