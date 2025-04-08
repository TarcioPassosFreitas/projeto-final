import socket
import json
import selectors
import sys
import traceback
from controller import route_request
from utils.time_utils import get_current_timestamp


class Server:
    def __init__(self, host='0.0.0.0', port=8888, max_connections=100):
        self.host = host
        self.port = port
        self.max_connections = max_connections
        self.selector = selectors.DefaultSelector()
        self.running = False

    def start(self):
        """Inicializa e executa o servidor."""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # Permite reutilizar o endereço/porta
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(self.max_connections)
            # Define o socket como não-bloqueante
            self.server_socket.setblocking(False)

            # Registra o socket do servidor com o seletor
            self.selector.register(self.server_socket, selectors.EVENT_READ, data=None)

            self.running = True
            print(f"Servidor iniciado em {self.host}:{self.port}")

            while self.running:
                # Aguarda eventos em qualquer socket registrado
                events = self.selector.select(timeout=1)
                for key, mask in events:
                    if key.data is None:
                        # Caso seja o socket do servidor, aceita nova conexão
                        self._accept_connection(key.fileobj)
                    else:
                        # Caso seja um socket de cliente, processa os dados
                        self._handle_client_data(key, mask)

        except KeyboardInterrupt:
            print("Servidor interrompido pelo usuário")
        except Exception as e:
            print(f"Erro no servidor: {e}")
            traceback.print_exc()
        finally:
            self.stop()

    def stop(self):
        """Encerra o servidor de forma segura."""
        print("Encerrando servidor...")
        self.running = False

        # Fecha todos os sockets registrados
        for key in list(self.selector.get_map().values()):
            try:
                self.selector.unregister(key.fileobj)
                key.fileobj.close()
            except:
                pass

        self.selector.close()
        print("Servidor encerrado")

    def _accept_connection(self, server_socket):
        """Aceita uma nova conexão de cliente."""
        try:
            client_socket, client_address = server_socket.accept()
            print(f"Conexão aceita de {client_address}")

            # Define o socket do cliente como não-bloqueante
            client_socket.setblocking(False)

            # Cria estrutura de dados para acompanhar esta conexão
            data = {
                "address": client_address,
                "inb": b"",  # Buffer de entrada
                "outb": b"",  # Buffer de saída
                "connected": True
            }

            # Registra o novo socket para leitura e escrita
            self.selector.register(client_socket, selectors.EVENT_READ | selectors.EVENT_WRITE, data=data)

        except Exception as e:
            print(f"Erro ao aceitar conexão: {e}")

    def _handle_client_data(self, key, mask):
        """Processa dados de um cliente."""
        client_socket = key.fileobj
        data = key.data

        if not data["connected"]:
            self._close_connection(client_socket)
            return

        try:
            if mask & selectors.EVENT_READ:
                recv_data = client_socket.recv(4096)

                if recv_data:
                    data["inb"] += recv_data
                    while b'\n' in data["inb"]:
                        raw_message, data["inb"] = data["inb"].split(b'\n', 1)
                        self._process_message(data, raw_message)
                else:
                    print(f"Conexão fechada pelo cliente {data['address']}")
                    data["connected"] = False

            if mask & selectors.EVENT_WRITE and data["outb"]:
                sent = client_socket.send(data["outb"])
                data["outb"] = data["outb"][sent:]

                if not data["outb"] and not data["connected"]:
                    self._close_connection(client_socket)

        except ConnectionResetError:
            print(f"Conexão resetada pelo cliente {data['address']}")
            self._close_connection(client_socket)
        except Exception as e:
            print(f"Erro ao processar dados do cliente {data['address']}: {e}")
            traceback.print_exc()
            self._close_connection(client_socket)

    def _check_complete_json(self, data):
        """Verifica se temos um JSON completo no buffer."""
        try:
            # Tenta converter o buffer para string e depois para JSON
            json_str = data.decode('utf-8')
            # Se decodificar sem erro, é um JSON completo
            json.loads(json_str)
            return True
        except (json.JSONDecodeError, UnicodeDecodeError):
            # Se não for um JSON completo, continua recebendo dados
            return False

    def _process_message(self, data, raw_message):
        """Processa uma mensagem JSON recebida."""
        try:
            json_str = raw_message.decode('utf-8')
            request = json.loads(json_str)
            print(f"[RECEBIDO] {data['address']}: {json_str}")

            response = route_request(request)
            response_bytes = json.dumps(response).encode('utf-8') + b'\n'
            data["outb"] += response_bytes

        except json.JSONDecodeError:
            error_response = {
                "type": "error",
                "data": {},
                "status": {"code": 400, "message": "JSON inválido"},
                "timestamp": get_current_timestamp()
            }
            data["outb"] += json.dumps(error_response).encode('utf-8') + b'\n'

        except Exception as e:
            error_response = {
                "type": "error",
                "data": {},
                "status": {"code": 500, "message": f"Erro interno: {str(e)}"},
                "timestamp": get_current_timestamp()
            }
            data["outb"] += json.dumps(error_response).encode('utf-8') + b'\n'
            data["inb"] = b""

    def _close_connection(self, client_socket):
        """Fecha a conexão com um cliente de forma segura."""
        try:
            print(f"Fechando conexão com {client_socket.getpeername()}")
        except:
            pass

        self.selector.unregister(client_socket)
        client_socket.close()


if __name__ == "__main__":
    # Permite definir a porta via linha de comando
    port = 8888
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Porta inválida: {sys.argv[1]}. Usando porta padrão 8888.")

    server = Server(port=port)
    server.start()
