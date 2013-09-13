window.onload = function() {
	cadastro.inicializar(cadastro.listar);
};

var cadastro = (function(){
	// private
	var obj = {};

	// public
	obj.dbName = "BancodeClientes4";
    
	obj.inicializar = function(callback){
		var request = window.indexedDB.open(obj.dbName, 1);
		request.onerror = function(event){
		  console.log(event.target);
		}
		request.onsuccess = function(event){
		  obj.db = request.result;
		  callback();
		}
		request.onupgradeneeded = function(event){
		  obj.db = event.target.result;
		  var objectStore = obj.db.createObjectStore("clientes",{keyPath: "id"});
		  objectStore.createIndex("name", "nome", {unique: false});
		}
	}

    obj.novo = function(id, nome, idade){
      	var novoCliente = {
          id:id, 
          nome:nome, 
          idade:idade
        };
		var transaction = obj.db.transaction(['clientes'], "readwrite");
		var objectStore = transaction.objectStore("clientes");
		var request = objectStore.put(novoCliente);
		request.oncomplete = function(event) {
			alert("Cliente Cadastrado com Sucesso");
		};
		request.onerror = function (event){
			alert("Erro ao cadastrar cliente "+event.target.errorCode);
		}
    }

    obj.listar = function(){
      $("#tbResultado").html("");
      var transaction = obj.db.transaction(['clientes'], "readwrite");
      var store = transaction.objectStore(['clientes']);
      var cursorRequest = store.openCursor();
      cursorRequest.onsuccess = function(evt) {                    
        var cursor = evt.target.result;
        var cliente;
        if (cursor) {
        	cliente = cursor.value;
      		$("#tbResultado").append("<tr><td onclick='cadastro.remover("+cliente.id+")'>"+cliente.id+"</td><td>"+cliente.nome+"</td><td>"+cliente.idade+"</td></tr>");            
  			cursor.continue();
        }
      };
    }

    obj.remover = function delCliente(id){
      var transaction = obj.db.transaction(['clientes'], "readwrite");
      var store = transaction.objectStore(['clientes']);
      var request = store.delete(id);

      request.onerror = function(e){
        console.log("Erro");
      }

      request.onsuccess = function(e){
        alert("Removido com sucesso");
        obj.listar();
      }
    }

    obj.consultarNome = function(nome){
      var transaction = obj.db.transaction(['clientes'], "readwrite");
      var objectStore = transaction.objectStore(['clientes']);
      var index = objectStore.index("name");
      index.get(nome).onsuccess = function(event) {
        alert("O id da "+nome+" é "+ event.target.result.id);
      };
    }
	return obj;
}());

function novoCliente(){
	var id = parseInt(document.getElementById("id").value);
	var nome = document.getElementById("nome").value;
	var idade = document.getElementById("idade").value;
	cadastro.novo(id,nome,idade);
	cadastro.listar();
}

function mensagem(texto, tipo){
	$('#mensagem').html(texto).removeClass();
	if(tipo == "erro"){
	  $('#mensagem').addClass("alert alert-danger");
	} else {
	  $('#mensagem').addClass("alert alert-success");
	}
}