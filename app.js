let carrinho = [];

// Recupera o carrinho salvo no navegador (se houver)
try { carrinho = JSON.parse(localStorage.getItem("carrinho")) || []; } catch (e) { carrinho = []; }

const $ = (id) => document.getElementById(id);
const dinheiro = (v) => "R$ " + v.toFixed(2).replace(".", ",");
const salvar = () => { try { localStorage.setItem("carrinho", JSON.stringify(carrinho)); } catch (e) {} };

// Dados da loja
$("nomeLoja").textContent = CONFIG.nomeLoja;
$("logo").src = CONFIG.logo;
$("ano").textContent = new Date().getFullYear();

// Lista de produtos
function mostrarProdutos() {
  $("lista").innerHTML = PRODUTOS.map(p => `
    <article class="card">
      <img src="${p.imagem}" alt="${p.nome}" loading="lazy"
           onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23888%22 font-family=%22Arial%22 font-size=%2222%22>Sem foto</text></svg>'">
      <div class="info">
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <div class="preco">${dinheiro(p.preco)}</div>
        <button class="btn-add" onclick="adicionar(${p.id})">Adicionar ao carrinho</button>
      </div>
    </article>`).join("");
}

function adicionar(id) {
  const existente = carrinho.find(i => i.id === id);
  if (existente) existente.qtd++;
  else carrinho.push({ id, qtd: 1 });
  salvar(); atualizar(); abrir();
}

function mudarQtd(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter(i => i.id !== id);
  salvar(); atualizar();
}

function remover(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvar(); atualizar();
}

function atualizar() {
  let total = 0, qtdTotal = 0;
  const html = carrinho.map(i => {
    const p = PRODUTOS.find(x => x.id === i.id);
    if (!p) return "";
    total += p.preco * i.qtd;
    qtdTotal += i.qtd;
    return `<div class="item">
      <div>
        <strong>${p.nome}</strong>
        <div class="qtd">
          <button onclick="mudarQtd(${p.id}, -1)">-</button>
          <span>${i.qtd}</span>
          <button onclick="mudarQtd(${p.id}, 1)">+</button>
          <button class="remover" onclick="remover(${p.id})">remover</button>
        </div>
      </div>
      <div>${dinheiro(p.preco * i.qtd)}</div>
    </div>`;
  }).join("");

  $("itens").innerHTML = html || '<p class="vazio">Seu carrinho está vazio.</p>';
  $("total").textContent = dinheiro(total);
  $("contador").textContent = qtdTotal;
  $("finalizar").disabled = qtdTotal === 0;
}

function abrir()  { $("gaveta").classList.add("ativa");    $("fundo").classList.add("ativo"); }
function fechar() { $("gaveta").classList.remove("ativa"); $("fundo").classList.remove("ativo"); }

function finalizarPedido() {
  let total = 0;
  let msg = `Olá! Gostaria de fazer este pedido na ${CONFIG.nomeLoja}:\n\n`;

  carrinho.forEach(i => {
    const p = PRODUTOS.find(x => x.id === i.id);
    if (!p) return;
    const sub = p.preco * i.qtd;
    total += sub;
    msg += `• ${i.qtd}x ${p.nome} - ${dinheiro(sub)}\n`;
  });

  msg += `\n*Total: ${dinheiro(total)}*`;

  const nome = $("nomeCliente").value.trim();
  const end = $("endereco").value.trim();
  const pag = $("pagamento").value.trim();
  if (nome) msg += `\n\nNome: ${nome}`;
  if (end)  msg += `\nEndereço: ${end}`;
  if (pag)  msg += `\nPagamento: ${pag}`;

  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

$("btnCarrinho").addEventListener("click", abrir);
$("fechar").addEventListener("click", fechar);
$("fundo").addEventListener("click", fechar);
$("finalizar").addEventListener("click", finalizarPedido);

mostrarProdutos();
atualizar();
