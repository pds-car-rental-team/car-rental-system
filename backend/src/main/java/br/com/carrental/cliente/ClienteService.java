package br.com.carrental.cliente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.carrental.cliente.dto.ClienteRequest;
import br.com.carrental.cliente.dto.ClienteResponse;
import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;
import br.com.carrental.shared.util.Texto;

@Service
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        String cpf = Texto.apenasDigitos(request.cpf());
        if (repository.existsByCpf(cpf)) {
            throw cpfDuplicado();
        }

        Cliente cliente = new Cliente(request.nome().trim(), cpf, normalizarEmail(request.email()),
                Texto.apenasDigitos(request.telefone()));
        return ClienteResponse.de(repository.save(cliente));
    }

    public ClienteResponse buscarPorId(Long id) {
        return ClienteResponse.de(obter(id));
    }

    /**
     * Lista clientes paginados. Com {@code busca} preenchida, filtra pelo início do CPF
     * quando o termo só tem dígitos/máscara, ou por parte do nome nos demais casos.
     */
    public Page<ClienteResponse> listar(String busca, Pageable pageable) {
        String termo = busca == null ? "" : busca.trim();

        Page<Cliente> clientes;
        if (termo.isEmpty()) {
            clientes = repository.findAll(pageable);
        } else if (termo.matches("[\\d.\\-\\s]+")) {
            clientes = repository.findByCpfStartingWith(Texto.apenasDigitos(termo), pageable);
        } else {
            clientes = repository.findByNomeContainingIgnoreCase(termo, pageable);
        }
        return clientes.map(ClienteResponse::de);
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = obter(id);

        String cpf = Texto.apenasDigitos(request.cpf());
        if (repository.existsByCpfAndIdNot(cpf, id)) {
            throw cpfDuplicado();
        }

        cliente.atualizar(request.nome().trim(), cpf, normalizarEmail(request.email()),
                Texto.apenasDigitos(request.telefone()));
        return ClienteResponse.de(repository.saveAndFlush(cliente));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(obter(id));
    }

    private Cliente obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
    }

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private static ConflitoException cpfDuplicado() {
        return new ConflitoException("Já existe um cliente cadastrado com este CPF.");
    }
}
