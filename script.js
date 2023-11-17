document.addEventListener("DOMContentLoaded", function () {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

  let db;
  const request = indexedDB.open("pedidosDB", 1);

  request.onerror = function (event) {
    console.log("Erro ao abrir o banco de dados:", event.target.error);
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Banco de dados aberto com sucesso!");
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("pedidos", { autoIncrement: true });
    console.log("Banco de dados criado com sucesso!");
  };

  const adicionarBotoes = document.querySelectorAll(".adicionar");
  const listaPedido = document.getElementById("pedido");
  const totalElement = document.getElementById("total");

  let totalPedido = 0;

  // Função para atualizar o total do pedido
  function atualizarTotal() {
    totalElement.innerText = `Total: R$${totalPedido.toFixed(2)}`;
  }

  // Função para adicionar um item ao pedido
  function adicionarItem(nome, preco) {
    const novoItem = document.createElement("li");
    novoItem.innerText = `${nome} - R$${preco.toFixed(2)}`;
    listaPedido.appendChild(novoItem);

    // Adicione o preço do item ao total do pedido
    totalPedido += preco;
    atualizarTotal();

    // Adicione um evento de clique para o botão "Cancelar item" correspondente
    const cancelarBotao = document.createElement("button");
    cancelarBotao.innerText = "Cancelar item";
    cancelarBotao.addEventListener("click", function () {
      listaPedido.removeChild(novoItem);
      // Subtraia o preço do item do total do pedido quando for cancelado
      totalPedido -= preco;
      atualizarTotal();
    });
    novoItem.appendChild(cancelarBotao);
  }

  // Adicionar evento de clique para cada botão "Adicionar item"
  adicionarBotoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const nome = botao.getAttribute("data-nome");
      const preco = parseFloat(botao.getAttribute("data-preco"));
      adicionarItem(nome, preco);
    });
  });

  const finalizarPedidoButton = document.getElementById('finalizar-pedido');

  finalizarPedidoButton.addEventListener('click', function() {
    // Obtenha o nome do usuário
    const nomeUsuario = document.getElementById('nome').value;
  
    // Verifique se um nome foi fornecido
    if (nomeUsuario.trim() === "") {
      alert("Por favor, insira seu nome antes de finalizar o pedido.");
      return;
    }
  
    // Crie um objeto representando o pedido
    const pedido = {
      nome: nomeUsuario,
      total: totalPedido.toFixed(2),
      data: new Date().toLocaleString(),
      itens: [] // Um array para armazenar os itens do pedido
    };
  
    // Obtenha todos os itens do pedido
    const listaItens = listaPedido.getElementsByTagName('li');
    for (let i = 0; i < listaItens.length; i++) {
      const itemTexto = listaItens[i].textContent;
      const partes = itemTexto.split(" - R$");
      const nomeItem = partes[0];
      const precoItem = parseFloat(partes[1]);
      pedido.itens.push({ nome: nomeItem, preco: precoItem });
    }
  
    // Abra uma transação no banco de dados
    const transaction = db.transaction(["pedidos"], "readwrite");
    const objectStore = transaction.objectStore("pedidos");
  
    // Adicione o pedido ao banco de dados
    const request = objectStore.add(pedido);
  
    request.onsuccess = function() {
      // Mostre um alerta com o número do pedido, nome do usuário e total do pedido
      const numeroAleatorio = Math.floor(Math.random() * 1000);
      alert(`Pedido finalizado. Sua comanda é a N°${numeroAleatorio}. Nome: ${nomeUsuario}. Total: R$${totalPedido.toFixed(2)}`);
      
      // Limpe o pedido atual
      listaPedido.innerHTML = "";
      totalPedido = 0;
      atualizarTotal();
  
      // Redirecione para uma nova página ou simplesmente recarregue a página
      // window.location.reload(); // Isso recarregará a página
    };
  
    request.onerror = function() {
      console.log("Erro ao adicionar o pedido ao banco de dados:", request.error);
    };
  });
});
